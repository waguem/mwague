from decimal import Decimal

from loguru import logger
from sqlmodel import Session, func

from sqlalchemy import select, case, or_
from sqlalchemy.ext.asyncio import AsyncSession

from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol

from mkdi_backend.api.deps import KcUser
from mkdi_backend.config import settings
from mkdi_backend.models.Account import Account
from mkdi_backend.models.Agent import Agent
from mkdi_backend.models.office import Office, OfficeWallet
from mkdi_backend.utils.database import CommitMode, managed_tx_method


class AccountRepository:
    """
    Repository class for managing accounts.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_office_fund_account(self, office_id: str) -> Account:
        """
        Retrieves the fund account associated with a specific office.

        Args:
            office_id (str): The ID of the office.

        Returns:
            Account: The fund account associated with the office.
        """
        return (
            self.db.query(Account)
            .filter(Account.owner_id == office_id, Account.type == protocol.AccountType.FUND)
            .first()
        )

    def hasOpennedAccount(self, owner_id: str, type: protocol.AccountType) -> bool:
        return (
            self.db.query(Account)
            .filter(Account.owner_id == owner_id, Account.type == type)
            .first()
            is not None
        )

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
            case protocol.AccountType.FUND | protocol.AccountType.OFFICE:
                owner = (
                    self.db.query(Office).filter(Office.initials == input.owner_initials).first()
                )

                if self.hasOpennedAccount(owner.id, input.type):
                    raise MkdiError(
                        f"Account with initials {input.initials} and type {input.type} already exists",
                        error_code=MkdiErrorCode.DUPLICATE_ERROR,
                    )

            case protocol.AccountType.AGENT | protocol.AccountType.SUPPLIER:
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
            office_id=owner.office_id if isinstance(owner, Agent) else owner.id,
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
        return self.db.scalars(
            select(Account)
            .where(Account.office_id == office_id)
            .filter(
                or_(
                    Account.type == protocol.AccountType.FUND,
                    Account.type == protocol.AccountType.OFFICE,
                )
            )
        ).all()

    def get_owner_accounts(self, owner_id: str) -> list[Account]:
        """
        Retrieves all accounts associated with a specific owner.

        Args:
            owner_id (str): The ID of the owner.

        Returns:
            list[Account]: A list of accounts associated with the owner.
        """
        return self.db.query(Account).filter(Account.owner_id == owner_id).all()

    async def a_check_invariant(self, office_id: str) -> bool:
        """
        Check the invariant for the given organization and office.

        Args:
            org_id (str): The ID of the organization.
            office_id (str): The ID of the office.

        Returns:
            bool: True if the invariant holds, False otherwise.
        """
        try:

            # Query to get the sum of balances for positive accounts and the fund account balance in one go
            session: AsyncSession = self.db
            result = await session.execute(
                select(
                    func.sum(
                        case(
                            (Account.type != protocol.AccountType.FUND, Account.balance), else_=0
                        ).label("positive_balance_sum")
                    ),
                    func.sum(
                        case(
                            (Account.type == protocol.AccountType.FUND, Account.balance), else_=0
                        ).label("fund_balance")
                    ),
                ).where(Account.office_id == office_id)
            )
            positive_balance_sum, fund_balance = result.one()

            wallet_stm = await self.db.execute(
                select(func.sum(OfficeWallet.value)).where(OfficeWallet.office_id == office_id)
            )

            wallet_balance_sum = wallet_stm.scalar()
            wallet_balance_sum = wallet_balance_sum or 0

            # Convert None to 0 if there are no positive accounts or no fund account
            positive_balance_sum = positive_balance_sum or 0
            fund_balance = fund_balance or 0

            logger.info(
                f"Total positive balance: {positive_balance_sum}, Fund account balance: {fund_balance}"
            )

            # Check the invariant
            invariant_check = Decimal(positive_balance_sum) - Decimal(
                fund_balance + wallet_balance_sum
            )
            logger.debug(f"Invariant difference: {invariant_check}")
            # whe should accept a small difference due to floating point precision

            return abs(invariant_check) < Decimal(settings.INVARIANT_TOLERANCE)

        except Exception as e:
            logger.error(f"Error checking invariant: {e}")
            return False

    def get_invariant(self, office_id: str) -> Decimal:

        positive_balance_sum = self.db.execute(
            select(
                func.sum(Account.balance).filter(Account.type != protocol.AccountType.FUND)
            ).where(Account.office_id == office_id)
        ).scalar()

        fund_balance = self.db.scalar(
            select(
                func.sum(Account.balance).filter(Account.type == protocol.AccountType.FUND)
            ).where(Account.office_id == office_id)
        )

        wallet_balance_sum = self.db.execute(
            select(func.sum(OfficeWallet.value)).where(OfficeWallet.office_id == office_id)
        ).scalar()

        wallet_balance_sum = wallet_balance_sum or 0
        # Convert None to 0 if there are no positive accounts or no fund account
        positive_balance_sum = positive_balance_sum or 0

        fund_balance = fund_balance or 0

        # Check the invariant
        return Decimal(positive_balance_sum) - Decimal(fund_balance + wallet_balance_sum)

    def check_invariant(self, office_id: str) -> bool:
        """
        Check the invariant for the given organization and office.

        Args:
            org_id (str): The ID of the organization.
            office_id (str): The ID of the office.

        Returns:
            bool: True if the invariant holds, False otherwise.
        """
        try:

            # Query to get the sum of balances for positive accounts and the fund account balance in one go
            positive_balance_sum, fund_balance = (
                self.db.query(
                    func.sum(Account.balance).filter(Account.type != protocol.AccountType.FUND),
                    func.sum(Account.balance).filter(Account.type == protocol.AccountType.FUND),
                )
                .filter(Account.office_id == office_id)
                .one()
            )

            wallet_balance_sum = self.db.execute(
                select(func.sum(OfficeWallet.value)).where(OfficeWallet.office_id == office_id)
            ).scalar()
            wallet_balance_sum = wallet_balance_sum or 0
            # Convert None to 0 if there are no positive accounts or no fund account
            positive_balance_sum = positive_balance_sum or 0
            fund_balance = fund_balance or 0

            logger.info(
                f"Total positive balance: {positive_balance_sum}, Fund account balance: {fund_balance}"
            )

            # Check the invariant
            invariant_check = Decimal(positive_balance_sum) - Decimal(
                fund_balance + wallet_balance_sum
            )
            logger.debug(f"Invariant difference: {invariant_check}")
            # whe should accept a small difference due to floating point precision

            return abs(invariant_check) < Decimal(settings.INVARIANT_TOLERANCE)

        except Exception as e:
            logger.error(f"Error checking invariant: {e}")
            return False

    def get_all_accounts(self, office_id: str) -> list[Account]:
        """
        Retrieves all accounts associated with a specific office.

        Args:
            office_id (str): The ID of the office.

        Returns:
            list[Account]: A list of accounts associated with the office.
        """
        return self.db.scalars(
            select(Account).where(Account.office_id == office_id).order_by(Account.type)
        ).all()
