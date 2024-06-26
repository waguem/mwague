from datetime import datetime
from typing import List

from mkdi_backend.models.Account import Account
from mkdi_backend.models.Activity import FundCommit
from mkdi_backend.models.models import KcUser
from mkdi_backend.models.transactions.transactions import Deposit
from mkdi_shared.schemas.protocol import CancelRequest, TransactionRequest, TransactionState, TransactionType

from .AbstractTransaction import AbstractTransaction


class DepositTransaction(AbstractTransaction):
    """
    """
    def generate_code(self):
        return f"{self.get_inputs().receiver}-DEP-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    def accounts(self)->List[Account]:
        """
        Only the office fund and the receiver account are used in a deposit transaction
        """
        receiver_account = self.use_account(self.get_inputs().receiver)
        _,fund= self.use_office_accounts()

        return [receiver_account,fund]

    def create_history(self,fund:Account):
        return FundCommit(
            v_from=(fund.balance-self.get_inputs().amount.amount),
            variation=self.get_inputs().amount.amount,
            activity_id=self.activity.id,
            date=datetime.now(),
            description="Deposit"
        )

    def transaction(self,code:str)->Deposit:
        return self.db.query(Deposit).filter(Deposit.code==code).one()

    def cancel(self):
        pass

    def enter(self):
        # money = Money(input.amount.amount,input.currency,input.amount.rate)
        receiver_account,fund = self.accounts()
        receiver_account.balance += self.get_inputs().amount.amount
        fund.balance += self.get_inputs().amount.amount
        self.db.add(receiver_account)
        self.db.add(fund)
        return receiver_account,fund

    def do_transaction(self) -> None:
        user: KcUser = self.user
        input: TransactionRequest = self.get_inputs()
        assert input.receiver is not None
        account,fund = self.enter()
        history = self.create_history(fund)
        deposit = Deposit(
            account_id=account.id,
            amount=input.amount.amount,
            code=self.generate_code(),
            created_at=datetime.now(),
            created_by=user.user_db_id,
            office_id=user.office_id,
            org_id=user.organization_id,
            rate=input.amount.rate,
            state=TransactionState.PAID,
            type=TransactionType.DEPOSIT
        )
        self.db.add(history)
        return deposit


    def cancel_transaction(self) -> None:

        pass
