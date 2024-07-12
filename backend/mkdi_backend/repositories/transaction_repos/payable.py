from abc import abstractmethod
import datetime
from sqlalchemy.ext.asyncio.session import AsyncSession
from mkdi_backend.repositories.transaction_repos.invariant import (
    async_managed_invariant_tx_method,
    CommitMode,
)
from mkdi_backend.repositories.transaction_repos.abstract_transaction import AbstractTransaction
from mkdi_backend.models.transactions.transactions import Payment
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from sqlmodel import func, select


class PayableTransaction(AbstractTransaction):

    @abstractmethod
    async def a_commit(
        self, amount: int, transaction: pr.TransactionDB, has_complete: bool
    ) -> list:
        """commit payment"""

    @abstractmethod
    async def get_a_transaction(self, code: str) -> pr.TransactionDB:
        """get a transaction"""

    @abstractmethod
    def cancel_payment(self, payment: Payment) -> None:
        """cancel payment on the transaction"""
        pass

    def get_payments(self) -> int:
        """get payments made on the transaction"""
        assert self.transaction is not None  # make sure a transactin is mapped
        # get payment made on the transaction
        return (
            self.db.query(Payment)
            .filter(
                Payment.transaction_id == self.transaction.id,
                Payment.transaction_type == self.transaction.type,
            )
            .all()
        )

    async def get_paid_amount(self, tr_id: str) -> int:
        """get the total amount paid on the transaction"""
        session: AsyncSession = self.db
        # get the total amount paid on the transaction
        # Prepare the statement to get the total amount paid on the transaction
        statement = select(func.sum(Payment.amount)).filter(
            Payment.transaction_id == tr_id, Payment.state == pr.PaymentState.PAID
        )
        q = await session.execute(statement)
        return q.scalar_one_or_none() or 0

    def is_partially_paid(self) -> bool:
        """check if the transaction is partially paid"""
        # get the total amount paid on the transaction
        # check if the transaction is partially paid
        return paid_amount < 0

    def is_payment_complete(self) -> bool:
        """check if payment is complete"""
        # sum all payments made on the transaction
        paid_amount = (
            self.db.query(func.sum(Payment.amount))
            .filter(
                Payment.transaction_id == self.transaction.id, Payment.state == pr.PaymentState.PAID
            )
            .one()
        )

        return paid_amount == self.transaction.amount

    @async_managed_invariant_tx_method(auto_commit=CommitMode.COMMIT)
    async def add_payment(self, payment: pr.PaymentRequest, code: str) -> Payment:
        """add payment to the transaction"""
        transaction = await self.get_a_transaction(code)
        self.set_transaction(transaction)

        # the transaction should not have a paid amount greather than the amount
        # get the total amount paid on the transaction
        paid = await self.get_paid_amount(transaction.id)
        if (paid + payment.amount) > transaction.amount:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE,
                message="Payment amount exceeds transaction amount",
            )
        # create a payment
        payment = Payment(
            amount=payment.amount,
            transaction_id=transaction.id,
            transaction_type=payment.payment_type,
            state=pr.PaymentState.PAID,
            notes={"notes": []},
        )
        payment.payment_date = datetime.datetime.now()
        # commit payment
        has_complete = (paid + payment.amount) == transaction.amount
        commits = await self.a_commit(payment.amount, transaction, has_complete=has_complete)

        transaction.save_commit(commits)
        if has_complete:
            transaction.state = pr.TransactionState.PAID

        self.db.add(transaction)

        return payment
