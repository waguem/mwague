"""Module providing a generic interface for transaction handling."""

from abc import ABC, abstractmethod
from typing import List, Tuple

from loguru import logger
from mkdi_backend.models.Account import Account, AccountType
from mkdi_backend.models.Activity import Activity
from mkdi_backend.models.models import KcUser
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from sqlmodel import Session


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
            user (KcUser): The user associated with the transaction.
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
        self, initials: str, account_type: AccountType = AccountType.AGENT
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
        logger.debug(f"Using account {initials}")
        return (
            self.db.query(Account)
            .filter(
                Account.initials == initials
                and Account.type == account_type
                and Account.office_id == self.user.office_id
            )
            .one()
        )

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
        return self.input.charges.amount

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
                case pr.ValidationState.INVALID:
                    review = self.reject
                case pr.ValidationState.CANCELLED:
                    review = self.cancel
                case _:
                    raise MkdiError(
                        error_code=MkdiErrorCode.INVALID_INPUT,
                        message="Invalid transaction request",
                    )
            logger.debug(f"Reviewing transaction {review}")

            if not review:
                logger.info("Could not find a review function")
                raise MkdiError(
                    error_code=MkdiErrorCode.INVALID_INPUT, message="Invalid transaction request"
                )
            logger.debug(f"Reviewing transaction {transaction}")
            transaction = review(transaction)
        except Exception as e:
            logger.error(f"Error reviewing transaction {e}")
            raise e

        return transaction

    @abstractmethod
    def approve(self, transaction: pr.TransactionDB) -> pr.TransactionResponse:
        """approve a transaction request

        Args:
            transaction (pr.TransactionDB): _description_

        Returns:
            pr.TransactionResponse: _description_
        """

    @abstractmethod
    def reject(self, transaction: pr.TransactionDB) -> pr.TransactionResponse:
        """reject a transaction request

        Args:
            transaction (pr.TransactionDB): _description_

        Returns:
            pr.TransactionResponse: _description_
        """

    @abstractmethod
    def cancel(self, transaction: pr.TransactionDB) -> pr.TransactionResponse:
        """cancel a transaction request

        Args:
            transaction (pr.TransactionDB): _description_

        Returns:
            pr.TransactionResponse: _description_
        """

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
