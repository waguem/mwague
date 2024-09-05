"""Internal Transaction Repository"""

from typing import List
import random
import string
from datetime import datetime

from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy import select, or_, and_
from mkdi_backend.models.Account import Account
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Payment, Sending
from mkdi_backend.repositories.transaction_repos.payable import PayableTransaction
from mkdi_backend.repositories.transaction_repos.invariant import managed_invariant_tx_method
from mkdi_backend.utils.database import CommitMode
from mkdi_backend.models.Activity import FundCommit
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
import json


class SendingTransaction(PayableTransaction):
    """
    Sending Transaction
    """

    async def a_commit(
        self, commited_amount, transaction: Sending, has_complete=False
    ) -> List[pr.TransactionCommit]:
        commits = []
        accounts: List[Account] = await self.a_accounts()

        office: Account = next((x for x in accounts if x.type == pr.AccountType.OFFICE), None)
        receiver: Account = next(
            (x for x in accounts if x.initials == transaction.receiver_initials), None
        )
        fund: Account = next((x for x in accounts if x.type == pr.AccountType.FUND), None)

        assert receiver is not None
        assert fund is not None

        if commited_amount > 0:
            # deposit for receiver +
            commits.append(receiver.credit(commited_amount))
            # the fund is  increased +
            commits.append(fund.credit(commited_amount))

        if has_complete and transaction.charges > 0:
            # the fund is increased +
            commits.append(fund.credit(transaction.charges))
            # the office has maid a benefice +
            commits.append(office.credit(transaction.charges))

        activity = await self.a_has_started_activity()

        fund_history = FundCommit(
            v_from=(fund.balance - commited_amount),
            variation=commited_amount,
            activity_id=activity["id"],
            description=f"Sending {transaction.code}",
            is_out=False,
            date=datetime.now(),
        )
        return commits, fund_history

    def accounts(self, receiver=None) -> List[Account]:
        request = self.get_inputs()
        charges = 0
        if hasattr(request, "data") and isinstance(request.data, pr.SendingRequest):
            receiver = request.data.receiver_initials
            charges = request.charges.amount if request.charges else 0
        elif receiver is None:
            tr: Sending = self.transaction
            receiver = tr.receiver_initials
            charges = tr.charges
        if charges > 0:
            condition = or_(Account.initials == receiver, Account.owner_id == self.user.office_id)
        else:
            # No charges, only the receiver account is needed
            condition = or_(
                Account.initials == receiver,
                and_(Account.owner_id == self.user.office_id, Account.type == pr.AccountType.FUND),
            )
        accounts = self.db.scalars(select(Account).where(condition).order_by(Account.type)).all()
        return accounts

    def get_transaction(self, code: str) -> pr.TransactionDB:
        return self.db.scalars(select(Sending).where(Sending.code == code)).one()

    def do_transaction(self) -> None:
        user: KcUser = self.user
        user_input: pr.SendingRequest = self.get_inputs().data

        assert isinstance(user_input, pr.SendingRequest)
        assert user_input.receiver_initials is not None

        accounts = self.accounts()
        payer = next((x for x in accounts if x.initials == user_input.receiver_initials), None)
        office = self.db.scalar(
            select(Account).where(
                Account.type == pr.AccountType.OFFICE, Account.owner_id == user.office_id
            )
        )

        if payer is None:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_INPUT,
                message="Payer account not found",
            )

        sending = Sending(
            amount=self.get_amount(),
            code=self.generate_code(office.initials, office.counter if office.counter else 0),
            office_id=user.office_id,
            org_id=user.organization_id,
            type=pr.TransactionType.SENDING,
            state=pr.TransactionState.REVIEW,
            charges=self.get_charges(),
            rate=self.get_rate(),
            created_by=user.user_db_id,
            history={"history": []},
            notes={"notes": []},
            payment_currency=user_input.payment_currency,
            method=user_input.payment_method,
            receiver_initials=user_input.receiver_initials,
        )

        notes = []
        notes = self.update_notes(notes, "REQUEST", self.get_inputs().message)
        sending.notes = json.dumps(notes)

        office.counter = office.counter + 1 if office.counter else 1
        self.db.add(sending)
        self.db.add(office)

        return sending

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, transaction: Sending) -> Sending:
        """
        Approve internal transaction
        """
        transaction.state = pr.TransactionState.PENDING
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)
        return transaction

    async def a_accounts(self, receiver=None) -> List[Account]:
        session: AsyncSession = self.db
        request = self.get_inputs()
        charges = 0
        if hasattr(request, "data") and isinstance(request.data, pr.ExternalRequest):
            data: pr.SendingRequest = request.data
            receiver = data.receiver_initials
        elif receiver is None:
            tr: Sending = self.transaction
            receiver = tr.receiver_initials
            charges = tr.charges

        # Define the condition based on the value of charges
        if charges > 0:
            condition = or_(
                Account.initials == receiver,
                Account.owner_id == self.user.office_id,  # FUND and OFFICE accounts
            )
        else:
            # No charges, only the receiver account is needed and the fund accounts
            condition = or_(
                Account.initials == receiver,
                and_(Account.owner_id == self.user.office_id, Account.type == pr.AccountType.FUND),
            )

        accounts = await session.scalars(select(Account).where(condition).order_by(Account.type))

        return accounts.all()

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def cancel_payment(self, payment: Payment) -> None:
        """cancel payment on the transaction"""
        pass
