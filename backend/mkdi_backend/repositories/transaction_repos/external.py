"""Internal Transaction Repository"""

from typing import List
import random

from datetime import datetime
import string

from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy import select, case, or_, and_
from mkdi_backend.models.Account import Account
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import External, Payment
from mkdi_backend.models.Activity import FundCommit
from mkdi_backend.repositories.transaction_repos.payable import PayableTransaction
from mkdi_backend.repositories.transaction_repos.invariant import (
    managed_invariant_tx_method,
    async_managed_invariant_tx_method,
)
from mkdi_backend.utils.database import CommitMode
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
import json


class ExternalTransaction(PayableTransaction):
    """
    External Transaction
    """

    def validate_review(self):
        """validate the review request for the transaction"""
        request: pr.TransactionReviewReq = self.get_inputs()
        transaction = self.get_transaction(request.code)
        assert transaction is not None
        assert request.amount.amount == transaction.amount
        assert request.charges.amount == transaction.charges
        assert request.data.sender == transaction.sender_initials

    async def a_commit(
        self, commited_amount, transaction: External, has_complete=False
    ) -> List[pr.TransactionCommit]:
        commits = []
        accounts: List[Account] = await self.a_accounts()

        office: Account = next((x for x in accounts if x.type == pr.AccountType.OFFICE), None)
        sender: Account = next(
            (x for x in accounts if x.initials == transaction.sender_initials), None
        )
        fund: Account = next((x for x in accounts if x.type == pr.AccountType.FUND), None)

        assert sender is not None
        assert fund is not None

        if commited_amount > 0:
            # out
            commits.append(sender.debit(commited_amount))
            # int
            commits.append(fund.debit(commited_amount))

        if has_complete and transaction.charges > 0:
            # out
            commits.append(sender.debit(transaction.charges))
            # in
            commits.append(office.credit(transaction.charges))
        activity = await self.a_has_started_activity()
        fund_history = FundCommit(
            v_from=(fund.balance),
            variation=commited_amount,
            account=transaction.sender_initials,
            activity_id=activity["id"],
            description=f"External {transaction.code}",
            is_out=True,
            date=datetime.now(),
        )
        return commits, fund_history

    def commit(self, transaction: External) -> List[pr.TransactionCommit]:
        """commit the transaction to the requested state

        Args:
            transaction (Internal): _description_

        Returns:
            List[pr.TransactionCommit]: _description_
        """
        if not hasattr(transaction, "amount") or not hasattr(transaction, "charges"):
            raise ValueError("Transaction must have 'amount' and 'charges' attributes")
        commits = []
        accounts = self.accounts()
        if len(accounts) < 2:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_INPUT, message="Insufficient accounts available"
            )

        # Assuming accounts are in a list where the last two are sender and receiver
        office = None
        if len(accounts) == 3:
            office = (
                accounts.pop()
            )  # Use the last account as the office account without removing it

        receiver = accounts.pop()
        sender = accounts.pop()

        # Check if an office account should be used

        if not sender or not receiver:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_INPUT,
                message="Unable to find sender or receiver account",
            )

        # Validate transaction amount and charges
        amount = transaction.amount
        charges = transaction.charges
        if amount <= 0 or charges < 0:
            raise ValueError("Transaction amount must be positive and charges cannot be negative")

        # Debit the sender and credit the receiver

        commits.append(sender.debit(amount))
        commits.append(receiver.credit(amount))

        # Handle charges if an office account is used
        if office and charges > 0:
            commits.append(office.credit(charges))
            commits.append(sender.debit(charges))

        return commits

    def do_transaction(self) -> None:
        user: KcUser = self.user
        user_input: pr.ExternalRequest = self.get_inputs().data

        assert isinstance(user_input, pr.ExternalRequest)
        assert user_input.sender is not None

        accounts = self.accounts()

        office = self.db.scalar(
            select(Account).where(
                Account.type == pr.AccountType.OFFICE, Account.owner_id == user.office_id
            )
        )

        if len(accounts) == 2:
            _ = accounts.pop()

        sender = accounts.pop()

        external = External(
            amount=self.get_amount(),
            code=self.generate_code(office.initials, office.counter if office.counter else 0),
            office_id=user.office_id,
            org_id=user.organization_id,
            type=pr.TransactionType.EXTERNAL,
            state=pr.TransactionState.REVIEW,
            charges=self.get_charges(),
            rate=self.get_rate(),
            sender_initials=sender.initials,
            customer=user_input.customer.dict() if user_input.customer else {},
            created_by=user.user_db_id,
            history={"history": []},
        )
        notes = []
        tags = list()

        if self.input.tags:
            tags = self.input.tags.split(",")

        notes = self.update_notes(notes, "REQUEST", self.get_inputs().message, tags)
        external.notes = json.dumps(notes)
        office.counter = office.counter + 1 if office.counter else 1
        self.db.add(external)
        self.db.add(office)
        return external

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, transaction: External) -> External:
        """
        Approve internal transaction
        """
        transaction.state = pr.TransactionState.PENDING
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)
        return transaction

    async def a_accounts(self, sender=None) -> List[Account]:
        session: AsyncSession = self.db
        request = self.get_inputs()
        charges = 0
        if hasattr(request, "data") and isinstance(request.data, pr.ExternalRequest):
            sender = request.data.sender
        elif sender is None:
            tr: External = self.transaction
            sender = tr.sender_initials
            charges = tr.charges

        # Define the condition based on the value of charges
        if charges > 0:
            condition = or_(
                Account.initials == sender,
                Account.owner_id == self.user.office_id,  # FUND and OFFICE accounts
            )
        else:
            # No charges, only the sender account is needed and the fund accounts
            condition = or_(
                Account.initials == sender,
                and_(Account.owner_id == self.user.office_id, Account.type == pr.AccountType.FUND),
            )

        accounts = await session.scalars(select(Account).where(condition).order_by(Account.type))

        return accounts.all()

    def accounts(self, sender=None) -> List[Account]:
        """return the linked accounts for the transaction

        Returns:
            List[Account]: _description_
        """

        request: pr.ExternalRequest = self.get_inputs()

        request = request.data if hasattr(request, "data") else None

        if request is None and sender is None:
            # reviewing the transaction
            tr: External = self.transaction
            sender = tr.sender_initials

        condition = None

        if self.get_charges() > 0:
            condition = or_(
                Account.initials == sender,
                Account.owner_id == self.user.office_id,  # FUND and OFFICE accounts
            )
        else:
            # No charges, only the sender account is needed and the fund accounts
            condition = or_(
                Account.initials == sender,
                and_(Account.owner_id == self.user.office_id, Account.type == pr.AccountType.FUND),
            )

        # if there are charges, add the office account
        accounts = self.db.scalars(select(Account).where(condition)).all()

        return accounts

    def get_transaction(self, code: str) -> External:
        """
        get internal transaction
        """
        return self.db.query(External).filter(External.code == code).one()

    def rollback(self, transaction: External) -> pr.TransactionResponse:
        pass

    def cancel_payment_commit(self, payment: Payment):
        commits = list()
        accounts = self.accounts()

        office: Account = next((x for x in accounts if x.type == pr.AccountType.OFFICE), None)
        sender: Account = next(
            (x for x in accounts if x.initials == self.transaction.sender_initials), None
        )
        fund: Account = next((x for x in accounts if x.type == pr.AccountType.FUND), None)

        assert sender is not None
        assert fund is not None
        assert payment.amount > 0

        commits.append(sender.credit(payment.amount))
        commits.append(fund.credit(payment.amount))

        if payment.amount == self.transaction.amount:
            if self.get_charges() > 0:
                commits.append(sender.credit(self.transaction.charges))
                commits.append(office.debit(self.transaction.charges))

        activity = self.has_started_activity()

        fund_history = FundCommit(
            v_from=(fund.balance),
            variation=payment.amount,
            account=self.transaction.sender_initials,
            activity_id=activity.id,
            description=f"Cancelling External {self.transaction.code}",
            is_out=False,
            date=datetime.now(),
        )

        self.transaction.save_commit(commits)

        return fund_history
