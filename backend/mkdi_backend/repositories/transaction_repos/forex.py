"""Foreign Exchange Transaction Repository"""

from typing import List

from mkdi_backend.utils.database import managed_tx_method
from mkdi_backend.repositories.transaction_repos.invariant import (
    managed_invariant_tx_method,
    CommitMode,
)
from mkdi_backend.repositories.transaction_repos.payable import PayableTransaction
from mkdi_backend.models.transactions.transactions import Payment, ForEx as ForeignEx
from mkdi_backend.models.Account import Account
from mkdi_backend.models.office import OfficeWallet
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.models.Activity import FundCommit

from decimal import Decimal
from sqlmodel import select, or_, and_
import datetime
import random
import string


class ForExTransaction(PayableTransaction):
    """Foreign Exchange Transaction"""

    def generate_code(self, initial):
        """generate a unique code for the internal transaction"""
        random_part = "".join(
            random.choices(string.ascii_letters + string.digits, k=10 - len(initial))
        )
        code = f"{initial}{random_part}".upper()
        return code

    async def a_commit(
        self, amount, transaction: ForeignEx, has_complete=False
    ) -> List[pr.TransactionCommit]:
        commits = []
        accounts: List[Account] = await self.a_accounts()
        office: Account = next((x for x in accounts if x.type == pr.AccountType.OFFICE), None)
        sender: Account = next(
            (x for x in accounts if x.initials == transaction.customer_account), None
        )
        fund: Account = next((x for x in accounts if x.type == pr.AccountType.FUND), None)

        assert fund is not None
        assert sender is not None
        assert office is not None
        assert amount > 0

        assert abs(Decimal(amount) - transaction.buying_amount) <= 0.001
        # sender will be debited by the selling amount + extra charges
        commits.append(sender.debit(transaction.selling_amount))

        commits.append(fund.debit(transaction.buying_amount))
        commits.append(office.credit(transaction.forex_result))

        activity = await self.a_has_started_activity()
        transaction.state = pr.TransactionState.PAID

        fund_history = FundCommit(
            v_from=(fund.balance + amount),
            variation=amount,
            activity_id=activity["id"],
            description="Forex Transaction",
            date=datetime.datetime.now(),
        )
        return commits, fund_history

    def do_transaction(self) -> None:
        user = self.user
        user_input: pr.ForExRequest = self.get_inputs().data

        assert isinstance(user_input, pr.ForExRequest)

        provider_account = self.db.scalar(
            select(Account)
            .where(Account.initials == user_input.provider_account)
            .where(Account.office_id == user.office_id)
        )

        customer = self.db.scalar(
            select(Account)
            .where(Account.initials == user_input.customer_account)
            .where(Account.office_id == user.office_id)
        )

        assert provider_account is not None
        assert customer is not None

        forEx = ForeignEx(
            currency=user_input.currency,
            base_currency=user_input.base_currency,
            provider_account=provider_account.initials,
            customer_account=customer.initials,
            amount=user_input.amount,
            code=self.generate_code("FX"),
            rate=user_input.daily_rate,
            buying_rate=user_input.buying_rate,
            selling_rate=user_input.selling_rate,
            state=pr.TransactionState.REVIEW,
            history={"history": []},
            office_id=user.office_id,
            charge_percentage=0,
            org_id=user.organization_id,
            type=pr.TransactionType.FOREX,
            created_by=user.user_db_id,
        )

        self.db.add(forEx)
        return forEx

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, transaction: ForeignEx) -> ForeignEx:
        """approve the transaction"""
        # for buying the transaction this is payable so it goes pending first and wait for payment
        transaction.state = pr.TransactionState.PENDING
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)
        return transaction

    async def a_accounts(self, customer_account=None) -> List[Account]:
        session = self.db
        request: pr.ForExRequest = (
            self.get_inputs().data if hasattr(self.get_inputs(), "data") else None
        )

        if request is None and customer_account is None:
            tr: ForeignEx = self.transaction
            customer_account = tr.customer_account

        condition = or_(
            Account.initials == customer_account,
            and_(Account.type == pr.AccountType.FUND, Account.office_id == self.user.office_id),
            and_(Account.type == pr.AccountType.OFFICE, Account.office_id == self.user.office_id),
        )
        accounts = await session.scalars(select(Account).where(condition))

        return accounts.all()

    def accounts(self, customer_account=None, provider_account=None) -> List[Account]:
        request: pr.ForExRequest = self.get_inputs().data
        if request is None and customer_account is None:
            tr: ForeignEx = self.transaction
            customer_account = tr.account

        stmt = select(Account).where(
            or_(Account.initials == customer_account, Account.initials == provider_account)
        )

        accounts = self.db.exec(stmt).all()

        return accounts

    def get_transaction(self, code: str) -> ForeignEx:
        """
        get internal transaction
        """
        return self.db.scalar(select(ForeignEx).where(ForeignEx.code == code))

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def cancel_payment(self, payment: Payment) -> None:
        """cancel payment on the transaction"""
        pass
