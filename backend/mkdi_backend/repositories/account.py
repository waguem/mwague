from mkdi_backend.models.Account import Account
from mkdi_backend.models.models import KcUser
from mkdi_backend.utils.database import CommitMode, managed_tx_method
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

        account = Account(
            owner_id=input.owner_id,
            created_by=auth_user.id,
            type=input.type,
            currency=input.currency,
            balance=input.balance,
        )

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

    def get_agent_accounts(self, owner_id: str) -> list[Account]:
        """
        Retrieves all accounts associated with a specific owner.

        Args:
            owner_id (str): The ID of the owner.

        Returns:
            list[Account]: A list of accounts associated with the owner.
        """
        return self.db.query(Account).filter(Account.owner_id == owner_id).all()
