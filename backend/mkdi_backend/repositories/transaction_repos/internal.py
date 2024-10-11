"""Internal Transaction Repository"""

from datetime import datetime
from typing import List
from mkdi_backend.models.Account import Account
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Internal
from mkdi_backend.repositories.transaction_repos.abstract_transaction import AbstractTransaction
from mkdi_backend.repositories.transaction_repos.invariant import managed_invariant_tx_method
from mkdi_backend.utils.database import CommitMode
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from sqlalchemy import or_, select

import json


class InternalTransaction(AbstractTransaction):
    """
    Internal Transaction
    """

    def validate_review(self):
        """validate the review request for the transaction"""
        request: pr.TransactionReviewReq = self.get_inputs()
        transaction = self.get_transaction(request.code)
        assert transaction is not None
        assert request.amount.amount == transaction.amount
        assert request.charges.amount == transaction.charges
        assert request.data.sender == transaction.sender_initials
        assert request.data.receiver == transaction.receiver_initials

    def commit(self, transaction: Internal) -> List[pr.TransactionCommit]:
        """commit the transaction to the requested state

        Args:
            transaction (Internal): _description_

        Returns:
            List[pr.TransactionCommit]: _description_
        """
        if not hasattr(transaction, "amount") or not hasattr(transaction, "charges"):
            raise ValueError("Transaction must have 'amount' and 'charges' attributes")
        commits = []

        accounts = self.accounts(transaction.sender_initials, transaction.receiver_initials)

        if len(accounts) < 2:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_INPUT, message="Insufficient accounts available"
            )

        # Assuming accounts are in a list where the last two are sender and receiver
        office = next((a for a in accounts if a.type == pr.AccountType.OFFICE), None)
        sender = next((a for a in accounts if a.initials == transaction.sender_initials), None)
        receiver = next((a for a in accounts if a.initials == transaction.receiver_initials), None)

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
            commits.append(sender.debit(charges))
            # what if the office was the receiver ? then
            if receiver.id == office.id:
                commits.append(receiver.credit(charges))
            else:
                commits.append(office.credit(charges))

        return commits

    def do_transaction(self) -> None:
        user: KcUser = self.user
        user_input: pr.InternalRequest = self.get_inputs().data

        assert isinstance(user_input, pr.InternalRequest)
        assert user_input.receiver is not None
        assert user_input.sender is not None
        assert user_input.sender != user_input.receiver

        accounts = self.accounts(sender=user_input.sender, receiver=user_input.receiver)

        sender = next((a for a in accounts if a.initials == user_input.sender), None)
        receiver = next((a for a in accounts if a.initials == user_input.receiver), None)

        internal = Internal(
            amount=self.get_amount(),
            code=self.generate_code(sender.initials, sender.counter if sender.counter else 0),
            office_id=user.office_id,
            org_id=user.organization_id,
            type=pr.TransactionType.INTERNAL,
            state=pr.TransactionState.REVIEW,
            charges=self.get_charges(),
            rate=self.get_rate(),
            sender_initials=sender.initials,
            receiver_initials=receiver.initials,
            created_by=user.user_db_id,
            history={"history": []},
        )
        # load notes from internal
        notes = []
        tags = list()

        if self.input.tags:
            tags = self.input.tags.split(",")

        notes = self.update_notes(notes, "REQUEST", self.get_inputs().message, tags)
        internal.notes = json.dumps(notes)

        sender.counter = sender.counter + 1 if sender.counter else 1
        self.db.add(internal)
        self.db.add(sender)  # update the counter
        return internal

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, transaction: Internal):
        """
        Approve internal transaction
        """
        # start the commit
        commits = self.commit(transaction)
        transaction.save_commit(commits)

        transaction.state = pr.TransactionState.PAID
        return transaction

    def accounts(self, sender=None, receiver=None) -> List[Account]:
        """return the linked accounts for the transaction

        Returns:
            List[Account]: _description_
        """
        usr_input = self.get_inputs()
        request: pr.InternalRequest = usr_input.data if hasattr(usr_input, "data") else None
        if request is None and sender is None and receiver is None:
            # reviewing the transaction
            tr: Internal = self.transaction
            sender = tr.sender_initials
            receiver = tr.receiver_initials

        accounts = self.db.scalars(
            select(Account)
            .where(or_(Account.initials == sender, Account.initials == receiver))
            .filter(Account.office_id == self.user.office_id)
        ).all()

        # if the office is the sender then no charges will be applied
        sender = next((a for a in accounts if a.initials == sender), None)
        receiver = next((a for a in accounts if a.initials == receiver), None)
        assert sender is not None

        if sender.type == pr.AccountType.OFFICE:
            assert self.get_charges() == 0
        elif receiver.type != pr.AccountType.OFFICE and self.get_charges() > 0:
            office = self.db.scalars(
                select(Account).where(
                    Account.type == pr.AccountType.OFFICE, Account.office_id == self.user.office_id
                )
            ).one()
            accounts.append(office)

        # if there are charges, add the office account

        return accounts

    def get_transaction(self, code: str) -> Internal:
        """
        get internal transaction
        """
        return self.db.query(Internal).filter(Internal.code == code).one()

    def add_payment(self, code: str) -> pr.PaymentResponse:
        raise MkdiError(
            error_code=MkdiErrorCode.INVALID_STATE, message="Internal transactions cannot be paid"
        )

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def rollback_commit(self, transaction: Internal) -> Internal:
        accounts = self.accounts(transaction.sender_initials, transaction.receiver_initials)

        office = next((a for a in accounts if a.type == pr.AccountType.OFFICE), None)
        sender = next((a for a in accounts if a.initials == transaction.sender_initials), None)
        receiver = next((a for a in accounts if a.initials == transaction.receiver_initials), None)

        commits = list()

        commits.append(sender.credit(transaction.amount))
        commits.append(receiver.debit(transaction.amount))
        if office and transaction.charges > 0 and sender.type != pr.AccountType.OFFICE:
            commits.append(sender.credit(transaction.charges))

            if receiver.id == office.id:
                commits.append(receiver.debit(transaction.charges))
            else:
                commits.append(office.debit(transaction.charges))

        transaction.save_commit(commits)
        transaction.state = pr.TransactionState.REVIEW

        return transaction

    def rollback(self, transaction: Internal) -> pr.TransactionResponse:
        """roll back and cancel transaction"""
        transaction = self.rollback_commit(transaction)
        return transaction
