"""Deposit Transaction"""

from datetime import datetime
from typing import List
import secrets
import string
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import Activity
from mkdi_backend.models.Activity import FundCommit
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Deposit, TransactionWithDetails
from mkdi_backend.repositories.transaction_repos.abstract_transaction import AbstractTransaction
from mkdi_backend.repositories.transaction_repos.invariant import (
    CommitMode,
    managed_invariant_tx_method,
)
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlmodel import select
import json


class DepositTransaction(AbstractTransaction):
    """
    Deposit transaction
    """

    def validate_review(self):
        """validate the review inputs"""
        request: pr.TransactionReviewReq = self.get_inputs()

        transaction: Deposit = self.transaction
        receiverInput = request.data.receiver if request.data else transaction.owner_initials
        assert transaction is not None
        assert transaction.amount == request.amount.amount
        assert transaction.owner_initials == receiverInput

    def create_history(self, fund: Account, transaction: Deposit) -> FundCommit:
        """create a history for a deposit transaction"""
        return FundCommit(
            v_from=(fund.balance),
            variation=transaction.amount,
            activity_id=self.activity.id,
            account=transaction.owner_initials,
            date=datetime.now(),
            is_out=False,
            description=f"Deposit {transaction.code}",
        )

    def commit(self, transaction: Deposit):
        """commit the transaction to the database"""
        # money = Money(input.amount.amount,input.currency,input.amount.rate)
        commits = []
        receiver_account, fund = self.accounts()
        if not receiver_account or not fund:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE, message="Insufficient accounts available"
            )
        amount = transaction.amount
        if amount <= 0:
            raise MkdiError(error_code=MkdiErrorCode.INVALID_INPUT, message="Invalid amount")

        commits.append(receiver_account.credit(amount))
        commits.append(fund.credit(amount))

        self.db.add(receiver_account)
        self.db.add(fund)
        self.activity = self.db.scalar(
            select(Activity).where(
                Activity.state == pr.ActivityState.OPEN, Activity.office_id == self.user.office_id
            )
        )
        fund_history = self.create_history(fund, transaction)
        self.db.add(fund_history)
        return commits

    def do_transaction(self) -> Deposit:
        """create a deposit transaction"""
        user: KcUser = self.user
        user_input: pr.DepositRequest = self.get_inputs().data
        assert user_input.receiver is not None
        account = self.use_account(user_input.receiver)
        assert account is not None

        deposit = Deposit(
            owner_initials=account.initials,
            amount=self.get_amount(),
            code=self.generate_code(account.initials, account.counter if account.counter else 0),
            created_at=datetime.now(),
            created_by=user.user_db_id,
            office_id=user.office_id,
            org_id=user.organization_id,
            rate=self.get_rate(),
            state=pr.TransactionState.REVIEW,
            type=pr.TransactionType.DEPOSIT,
        )

        notes = []
        tags = list()
        if self.input.tags:
            tags = self.input.tags.split(",")
        notes = self.update_notes(notes, "REQUEST", self.get_inputs().message, tags)
        deposit.notes = json.dumps(notes)
        account.counter = account.counter + 1 if account.counter else 1

        self.db.add(deposit)
        self.db.add(account)
        return deposit

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, transaction: Deposit) -> Deposit:
        """Approve deposit transaction"""
        self.validate_review()
        commits = self.commit(transaction)
        transaction.save_commit(commits)
        transaction.state = pr.TransactionState.PAID
        transaction.reviwed_by = self.user.user_db_id
        return transaction

    def accounts(self, receiver=None) -> List[Account]:
        """
        Only the office fund and the receiver account are used in a deposit transaction
        """
        if self.get_inputs().data is None:
            # reviewing the transaction
            tr: Deposit = self.transaction
            receiver = tr.owner_initials
        else:
            receiver = self.get_inputs().data.receiver

        receiver_account = self.use_account(receiver)
        _, fund = self.use_office_accounts()

        return [receiver_account, fund]

    def get_transaction(self, code: str) -> pr.TransactionDB:
        """get deposit transaction"""
        return self.db.query(Deposit).filter(Deposit.code == code).one()
