"""Module providing a generic interface for transaction handling."""

from abc import ABC, abstractmethod
from typing import List, Tuple

from datetime import datetime
from loguru import logger
from sqlalchemy.ext.asyncio.session import AsyncSession
from mkdi_backend.models.Account import Account
from mkdi_backend.models import (
    Activity,
    Deposit,
    Internal,
    Sending,
    External,
    TransactionWithDetails,
    Payment,
    ForEx,
)

from mkdi_backend.models.models import KcUser
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from mkdi_backend.repositories.transaction_repos.invariant import has_activity_started

from sqlmodel import Session, select
import json


class AbstractTransaction(ABC):
    """
    Abstract base class for transaction handling.

    This class provides a blueprint for implementing different types of transactions.
    Subclasses of this class should implement the abstract methods defined here.

    Attributes:
        db (Session): The database session.
        user (KcUser): The user associated with the transaction.
        _accounts (list): The list of accounts involved in the transaction.
        activity: The current activity for the transaction.
        input: The user input for the transaction.
        transaction: The active transaction.

    """

    def __init__(self, db: Session, user: KcUser, user_input: any):
        """
        Initializes a new instance of the AbstractTransaction class.

        Args:
            db (Session): The database session.
            user (KcUser): The #user associated with the transaction.
            user_input (any): The user input for the transaction.

        """
        self.db = db
        self.user = user
        self._accounts = []
        self.activity = None
        self.input = user_input
        self.transaction = None

    def set_transaction(self, transaction: pr.TransactionDB):
        """
        set active transaction

        Args:
            transaction (pr.TransactionDB): _description_
        """
        self.transaction = transaction

    def get_db(self):
        """
        get active session

        Returns:
            DB session
        """
        return self.db

    async def a_has_started_activity(self):
        session: AsyncSession = self.db
        if not self.activity:
            self.activity = dict(
                await session.scalar(
                    select(Activity).where(
                        Activity.office_id == self.user.office_id,
                        Activity.state == pr.ActivityState.OPEN,
                    )
                )
            )

        return self.activity

    def has_started_activity(self):
        """
        return True is there's an active activity for the current transaction
        """
        if not self.activity:
            self.activity = (
                self.db.query(Activity)
                .filter(
                    Activity.office_id == self.user.office_id,
                    Activity.state == pr.ActivityState.OPEN,
                )
                .one()
            )
        return self.activity

    @has_activity_started
    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def request(self):
        """Request review for a transaction , this is stage one of every transaction

        Returns:
            the created transaction
        """
        # apply steps to request a transaction
        return self.do_transaction()

    def set_activity(self, activity: Activity):
        """set current activity

        Args:
            activity
        """
        self.activity = activity

    def use_office_accounts(self) -> Tuple[Account, Account]:
        """get office accounts

        Raises:
            Exception: Every office should have exactly two accounts

        Returns:
            Tuple[Account,Account]: the
        """
        # select account from db
        accounts = (
            self.db.query(Account)
            .filter(Account.owner_id == self.user.office_id)
            .order_by(Account.type)
            .all()
        )  # must be exactly 2 accounts
        if len(accounts) != 2:
            raise RuntimeError("Every office should have exactly two accounts")

        return accounts[0], accounts[1]

    def use_account(
        self, initials: str, account_type: pr.AccountType = pr.AccountType.AGENT
    ) -> Account | None:
        """
        Retrieves an account from the database based on the provided
        initials and account type.

        Args:
            initials (str): The initials of the account.
            account_type (AccountType, optional):
                The type of the account. Defaults to AccountType.AGENT.

        Returns:
            Account | None: The retrieved account if found, otherwise None.
        """
        # select account from db
        account = (
            self.db.query(Account)
            .where(Account.initials == initials)
            .filter(Account.office_id == self.user.office_id)
            .one()
        )

        return account

    def get_rate(self):
        """
        Returns the rate of the transaction amount.

        Returns:
            The rate of the transaction amount.
        """
        return self.input.amount.rate

    def get_charges(self):
        """
        Returns the amount of charges for the transaction.

        Returns:
            float: The amount of charges.
        """
        if hasattr(self.input, "charges") and self.input.charges:
            return self.input.charges.amount
        elif self.transaction and hasattr(self.transaction, "charges"):
            return self.transaction.charges

        if hasattr(self.transaction, "forex_result"):
            return self.transaction.forex_result
        return 0

    def get_amount(self):
        """
        Returns the amount of the transaction.

        Returns:
            float: The amount of the transaction.
        """
        return self.input.amount.amount

    def get_inputs(self) -> pr.TransactionRequest:
        """
        Returns the inputs of the transaction.

        Returns:
            list: The inputs of the transaction.
        """
        return self.input

    def review(self, code: str) -> pr.TransactionResponse:
        """Review a transaction"""

        transaction: pr.TransactionDB = self.get_transaction(code)
        if not transaction:
            raise MkdiError(
                error_code=MkdiErrorCode.NOT_FOUND,
                message=f"Transaction with code {code} not found",
            )

        self.set_transaction(transaction)

        if transaction.state != pr.TransactionState.REVIEW:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE,
                message=f"Cannot review transaction with state {transaction.state}",
            )

        user_input: pr.TransactionReviewReq = self.get_inputs()
        try:
            review = None
            match user_input.state:
                case pr.ValidationState.APPROVED:

                    review = self.approve
                case pr.ValidationState.REJECTED:
                    review = self.reject
                case pr.ValidationState.CANCELLED:
                    review = self.cancel
                case _:
                    raise MkdiError(
                        error_code=MkdiErrorCode.INVALID_INPUT,
                        message="Invalid transaction request",
                    )

            if not review:
                logger.info("Could not find a review function")
                raise MkdiError(
                    error_code=MkdiErrorCode.INVALID_INPUT, message="Invalid transaction request"
                )

            user_input: pr.TransactionReviewReq = self.get_inputs()
            note = user_input.notes or ""
            notes = json.loads(transaction.notes if hasattr(transaction, "notes") else "[]")
            self.update_notes(notes, "REVIEW", note)
            transaction.notes = json.dumps(notes)

            transaction = review(transaction)
        except Exception as e:
            logger.error(f"Error reviewing transaction {e}")
            raise e

        return transaction.to_response()

    @abstractmethod
    def approve(self, transaction: pr.TransactionDB) -> pr.TransactionResponse:
        """approve a transaction request

        Args:
            transaction (pr.TransactionDB): _description_

        Returns:
            pr.TransactionResponse: _description_
        """

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def update_transaction(self) -> pr.TransactionResponse:
        """update a transaction request"""

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def reject(self, transaction: pr.TransactionDB) -> pr.TransactionResponse:
        """reject a transaction request

        Args:
            transaction (pr.TransactionDB): _description_

        Returns:
            pr.TransactionResponse: _description_
        """
        transaction.state = pr.TransactionState.REJECTED
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)
        return transaction

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def cancel(self, transaction: pr.TransactionDB) -> pr.TransactionResponse:
        """cancel a transaction request

        Args:
            transaction (pr.TransactionDB): _description_

        Returns:
            pr.TransactionResponse: _description_
        """
        transaction.state = pr.TransactionState.CANCELLED
        transaction.reviwed_by = self.user.user_db_id
        self.db.add(transaction)

        return transaction

    @abstractmethod
    def rollback(self, transaction: pr.TransactionDB) -> pr.TransactionDB:
        """Rollback a commited transaction"""

    @abstractmethod
    def do_transaction(self) -> None:
        """add a transaction request and wait for approval"""

    @abstractmethod
    def accounts(self) -> List[Account]:
        """
        Returns a list of Account objects associated with this transaction.

        :return: A list of Account objects.
        """

    @abstractmethod
    def get_transaction(self, code: str) -> pr.TransactionDB:
        """
        Retrieves a transaction from the database based on the provided transaction code.

        Args:
            code (str): The transaction code.

        Returns:
            pr.TransactionDB: The retrieved transaction if found, otherwise None.
        """

    def get_model(self, tr_type: pr.TransactionType):
        """
        get the model for the transaction type

        Args:
            tr_type (pr.TransactionType): the transaction type

        Returns:
            the model for the transaction type
        """
        match tr_type:
            case pr.TransactionType.DEPOSIT:
                return Deposit
            case pr.TransactionType.EXTERNAL:
                return External
            case pr.TransactionType.INTERNAL:
                return Internal
            case pr.TransactionType.SENDING:
                return Sending
            case pr.TransactionType.FOREX:
                return ForEx
            case _:
                raise MkdiError(
                    error_code=MkdiErrorCode.INVALID_INPUT, message="Invalid transaction type"
                )

    async def get_a_transaction(
        self, tr_type: pr.TransactionType, code: str, include_payments=False
    ) -> TransactionWithDetails:
        """get a transaction"""
        session: AsyncSession = self.db
        model = self.get_model(tr_type)
        # if is payable return the payments list
        res = await session.execute(select(model).where(model.code == code))
        transaction = res.scalars().first()

        # not payable or completed
        if not (
            transaction
            and tr_type
            in [
                pr.TransactionType.EXTERNAL,
                pr.TransactionType.DEPOSIT,
                pr.TransactionType.SENDING,
                pr.TransactionType.FOREX,
            ]
            and include_payments
        ):
            return transaction
        # fetch payments
        payments_q = await session.execute(
            select(Payment).where(Payment.transaction_id == transaction.id)
        )
        payments = payments_q.scalars().all()
        transaction_with_details = model.withPayments(transaction, payments)
        transaction_with_details.payments = payments
        # compete from here
        return transaction_with_details

    def generate_code(self, initial, counter) -> str:
        """generate a unique code for the internal transaction"""
        now = datetime.now()
        month = now.strftime("%m")
        return f"{initial}{month}{counter+1:03}"

    def update_notes(self, notes, type, note, tags: List[str] | None = None):
        """create a note"""
        message = dict()
        message["date"] = datetime.isoformat(datetime.now())
        message["message"] = note if note else ""
        message["type"] = type
        message["user"] = self.user.user_db_id
        if tags:
            message["tags"] = tags
        notes.append(message)

        return notes
