"""Deposit Transaction"""

from datetime import datetime
from typing import List
from mkdi_backend.models.transactions.transactions import Payment
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import Activity
from mkdi_backend.models.Activity import FundCommit
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Deposit
from mkdi_backend.repositories.transaction_repos.payable import PayableTransaction
from mkdi_backend.repositories.transaction_repos.invariant import (
    CommitMode,
    managed_invariant_tx_method,
)
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from sqlmodel import select, and_, or_
import json


class DepositTransaction(PayableTransaction):
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
        transaction.state = pr.TransactionState.PENDING
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)
        return transaction

    def accounts(self, receiver=None) -> List[Account]:
        """
        Only the office fund and the receiver account are used in a deposit transaction
        """
        receiver = (
            self.get_inputs().data.receiver
            if hasattr(self.get_inputs(), "data") and hasattr(self.get_inputs().data, "receiver")
            else None
        )
        if not receiver:
            assert self.transaction is not None
            tr: Deposit = self.transaction
            receiver = tr.owner_initials

        cdt = [
            Account.initials == receiver,  # Account depositer,
            and_(Account.type == pr.AccountType.FUND, Account.office_id == self.user.office_id),
        ]

        return self.db.scalars(select(Account).where(or_(*cdt))).all()

    def get_transaction(self, code: str) -> pr.TransactionDB:
        """get deposit transaction"""
        return self.db.query(Deposit).filter(Deposit.code == code).one()

    def rollback(self, transaction: Deposit) -> pr.TransactionResponse:
        pass

    async def a_accounts(self, receiver=None) -> List[Account]:
        receiver = (
            self.get_inputs().data.receiver
            if hasattr(self.get_inputs(), "data") and hasattr(self.get_inputs().data, "receiver")
            else None
        )
        if not receiver:
            assert self.transaction is not None
            tr: Deposit = self.transaction
            receiver = tr.owner_initials

        cdt = [
            Account.initials == receiver,  # Account depositer,
            and_(Account.type == pr.AccountType.FUND, Account.office_id == self.user.office_id),
        ]
        return (await self.db.scalars(select(Account).where(or_(*cdt)))).all()

    async def a_commit(
        self, amount: int, transaction: pr.TransactionDB, has_complete: bool
    ) -> List:
        commits = list()
        accounts = await self.a_accounts()

        depositer: Account = next(
            (x for x in accounts if x.initials == transaction.owner_initials), None
        )
        fund: Account = next((x for x in accounts if x.type == pr.AccountType.FUND), None)

        assert depositer is not None
        assert fund is not None

        commits.append(depositer.credit(amount))
        commits.append(fund.credit(amount))
        activity = await self.a_has_started_activity()

        fund_history = FundCommit(
            v_from=(fund.balance),
            variation=amount,
            account=transaction.owner_initials,
            activity_id=activity["id"],
            description=f"Deposit {transaction.code}",
            is_out=False,
            date=datetime.now(),
        )
        return commits, fund_history

    def cancel_payment_commit(self, payment: Payment):
        commits = list()

        accounts = self.accounts()

        depositer: Account = next(
            (x for x in accounts if x.initials == self.transaction.owner_initials), None
        )
        fund: Account = next((x for x in accounts if x.type == pr.AccountType.FUND), None)

        commits.append(depositer.debit(payment.amount))
        commits.append(fund.debit(payment.amount))

        activity = self.has_started_activity()

        fund_history = FundCommit(
            v_from=fund.balance,
            variation=payment.amount,
            activity_id=activity.id,
            account=self.transaction.owner_initials,
            description=f"Cancelling Deposit {self.transaction.code}",
            is_out=True,
            date=datetime.now(),
        )

        self.transaction.save_commit(commits)

        return fund_history
