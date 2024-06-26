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


class InternalTransaction(AbstractTransaction):
    """
    Internal Transaction
    """

    def generate_code(self, initial):
        """generate a unique code for the internal transaction"""
        return f"{initial}{datetime.now().strftime('H%M%S')}"

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
        accounts = self.accounts()
        if len(accounts) < 2:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_INPUT, message="Insufficient accounts available"
            )

        # Assuming accounts are in a list where the last two are sender and receiver
        receiver = accounts.pop()
        sender = accounts.pop()
        office = None

        # Check if an office account should be used
        if len(accounts) >= 1:
            office = accounts[-1]  # Use the last account as the office account without removing it

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
        user_input: pr.InternalRequest = self.get_inputs().data

        assert isinstance(user_input, pr.InternalRequest)
        assert user_input.receiver is not None
        assert user_input.sender is not None
        assert user_input.sender != user_input.receiver

        accounts = self.accounts()

        if len(accounts) == 3:
            _ = accounts.pop()

        receiver, sender = accounts.pop(), accounts.pop()

        internal = Internal(
            amount=self.get_amount(),
            code=self.generate_code(sender.initials),
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

        self.db.add(internal)

        return internal

    def cancel_transaction(self, user: KcUser, user_input: pr.TransactionRequest) -> None:
        """cancel the transaction

        Args:
            user (KcUser): _description_
            input (pr.TransactionRequest): _description_
        """

    def reject(self, transaction: Internal):
        pass

    def cancel(self, transaction: Internal):
        pass

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

    def accounts(self) -> List[Account]:
        """return the linked accounts for the transaction

        Returns:
            List[Account]: _description_
        """

        request: pr.InternalRequest = self.get_inputs().data
        accounts = [self.use_account(request.sender), self.use_account(request.receiver)]

        # if there are charges, add the office account

        if self.get_charges() > 0:
            office_account, _ = self.use_office_accounts()
            accounts.append(office_account)

        return accounts

    def get_transaction(self, code: str) -> Internal:
        """
        get internal transaction
        """
        return self.db.query(Internal).filter(Internal.code == code).one()
