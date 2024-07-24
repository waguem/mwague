"""Foreign Exchange Transaction Repository"""

from typing import List
import random
import string

from mkdi_backend.utils.database import managed_tx_method
from mkdi_backend.repositories.transaction_repos.invariant import (
    managed_invariant_tx_method,
    CommitMode,
)
from mkdi_backend.repositories.transaction_repos.payable import PayableTransaction
from mkdi_backend.models.transactions.transactions import ForEx, Payment
from mkdi_backend.models.Account import Account
from mkdi_shared.schemas import protocol as pr


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
        self, amount, transaction: ForEx, has_complete=False
    ) -> List[pr.TransactionCommit]:
        pass

    def do_transaction(self) -> None:
        user = self.user
        user_input: pr.ForExRequest = self.get_inputs().data

        assert isinstance(user_input, pr.ForExRequest)
        assert user_input.provider_account is not None
        assert user_input.customer_account is not None

        forEx = ForEx(
            **user_input.dict(),
        )
        forEx.code = self.generate_code("FX")

        forEx.state = pr.TransactionState.REVIEW
        forEx.created_by = user.user_db_id
        forEx.history = {"history": []}
        forEx.rate = user_input.daily_rate
        forEx.office_id = user.office_id
        forEx.org_id = user.organization_id

        self.db.add(forEx)
        return forEx

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def approve(self, transaction: ForEx) -> ForEx:
        """approve the transaction"""
        transaction.state = pr.TransactionState.PENDING
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)
        return transaction

    async def a_accounts(self, customer_account=None, provider_account=None) -> List[Account]:
        pass

    def accounts(self, customer_account=None, provider_account=None) -> List[Account]:
        pass

    def get_transaction(self, code: str) -> ForEx:
        """
        get internal transaction
        """
        return self.db.query(ForEx).filter(ForEx.code == code).one()

    @managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    def cancel_payment(self, payment: Payment) -> None:
        """cancel payment on the transaction"""
        pass
