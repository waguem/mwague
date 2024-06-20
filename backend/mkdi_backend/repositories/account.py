from decimal import Decimal

from loguru import logger
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.models.models import KcUser
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session


class AccountRepository:
    """
    Repository class for managing accounts.
    """

    def __init__(self, db: Session):
        self.db = db

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def open_account(self, *, auth_user: KcUser, input: protocol.CreateAccountRequest) -> Account:
        """
        Opens a new account.

        Args:
            auth_user (KcUser): The authenticated user.
            input (protocol.CreateAccountRequest): The account creation request.

        Returns:
            Account: The created account.
        """
        # the owner account
        owner = None
        match input.type:
            case [
                protocol.AccountType.FUND,
                protocol.AccountType.OFFICE,
                protocol.AccountType.SUPPLIER,
            ]:
                logger.debug("Creating account for office or fund")
                # raise Http not implemented
                raise NotImplementedError("Creating account for office or fund is not implemented")
            case protocol.AccountType.AGENT:
                owner = self.db.query(Agent).filter(Agent.initials == input.owner_initials).first()

        if not owner:
            raise MkdiError(
                f"Owner with initials {input.owner_initials} not found",
                error_code=MkdiErrorCode.USER_NOT_FOUND,
            )

        account = Account(
            initials=input.initials,
            version=1,
            is_open=True,
            owner_id=owner.id,
            created_by=auth_user.user_db_id,
            type=input.type,
            currency=input.currency,
            balance=Decimal(0),
            office_id=owner.office_id,
        )
        logger.debug(f"Creating account {account}")
        self.db.add(account)
        return account

    def get_office_accounts(self, office_id: str) -> list[Account]:
        """
        Retrieves all accounts associated with a specific office.

        Args:
            office_id (str): The ID of the office.

        Returns:
            list[Account]: A list of accounts associated with the office.
        """
        return self.db.query(Account).filter(Account.office_id == office_id).all()

    def get_owner_accounts(self, owner_id: str) -> list[Account]:
        """
        Retrieves all accounts associated with a specific owner.

        Args:
            owner_id (str): The ID of the owner.

        Returns:
            list[Account]: A list of accounts associated with the owner.
        """
        return self.db.query(Account).filter(Account.owner_id == owner_id).all()
