from mkdi_backend.models.models import KcUser
from mkdi_backend.models.office import Office, OfficeWallet
from mkdi_backend.utils.database import CommitMode, managed_tx_method, async_managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from mkdi_backend.models.Activity import FundCommit, Activity
from mkdi_backend.repositories.account import AccountRepository
from sqlmodel import Session, select
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from copy import deepcopy
from typing import List
from datetime import datetime


class OfficeRepository:
    def __init__(self, db):
        self.db: Session = db

    def get_org_offices(self, organization_id: str):
        """return all offices for an organization"""
        return self.db.scalars(
            select(Office).where(Office.organization_id == organization_id)
        ).all()

    def get_all(self):
        """return all offices"""
        return self.db.scalars(select(Office)).all()

    def get_by_initials(self, initials: str):
        """return office by initials"""
        return self.db.scalar(select(Office).where(Office.initials == initials))

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(self, usr_input: protocol.CreateOfficeRequest, organization_id: str):

        office = self.db.scalar(
            select(Office).where(
                Office.initials == usr_input.initials, Office.organization_id == organization_id
            )
        )
        if office:
            raise MkdiError(
                f"Office {usr_input.initials} already exists",
                error_code=MkdiErrorCode.OFFICE_EXISTS,
            )

        office = Office(
            initials=usr_input.initials,
            name=usr_input.name,
            country=usr_input.country,
            organization_id=organization_id,
        )
        self.db.add(office)
        return office

    def get_office(self, office_id: str, organization_id: str):
        return self.db.scalar(
            select(Office).where(Office.id == office_id, Office.organization_id == organization_id)
        )

    async def get_by_id(self, office_id) -> Office | None:
        """return office by id"""
        session: AsyncSession = self.db
        return await session.scalar(select(Office).where(Office.id == office_id))

    @async_managed_tx_method(auto_commit=CommitMode.COMMIT)
    async def update_office(self, user: KcUser, office_id: str, data: protocol.UpdateOffice):
        session: AsyncSession = self.db
        query = await session.execute(select(Office).where(Office.id == office_id))
        office = query.scalars().first()

        if not office:
            raise MkdiError(
                f"Office with id {office_id} not found", error_code=MkdiErrorCode.NOT_FOUND
            )

        if not (
            data.name or data.baseCurrency or data.mainCurrency or data.currencies or data.country
        ):
            return office
        # update the office
        if data.name:
            office.name = data.name

        if data.baseCurrency or data.mainCurrency:

            if data.baseCurrency:
                # check if the base currency is in the currencies list
                item = next(
                    (item for item in office.currencies if item["name"] == data.baseCurrency), None
                )
                if not item:
                    raise MkdiError(
                        f"Currency {data.baseCurrency} not found",
                        error_code=MkdiErrorCode.INVALID_CURRENCY,
                    )
            if data.mainCurrency:
                item = next(
                    (item for item in office.currencies if item["name"] == data.mainCurrency), None
                )
                if not item:
                    raise MkdiError(
                        f"Currency {data.baseCurrency} not found",
                        error_code=MkdiErrorCode.INVALID_CURRENCY,
                    )

            curr_copy = deepcopy(office.currencies)
            office.currencies.clear()
            for currency in curr_copy:
                currency["base"] = (
                    currency["name"] == data.baseCurrency if data.baseCurrency else currency["base"]
                )
                currency["main"] = (
                    currency["name"] == data.mainCurrency if data.mainCurrency else currency["main"]
                )
                office.currencies.append(currency)

        if data.currencies:
            main = next((item for item in office.currencies if item["main"]), None)
            base = next((item for item in office.currencies if item["base"]), None)

            office.currencies.clear()
            for currency in data.currencies:
                office.currencies.append(
                    {
                        "name": currency,
                        "main": main["name"] == currency if main else False,
                        "base": base["name"] == currency if base else False,
                        "defaultRate": 1.0,
                    }
                )

        if data.country:
            office.country = data.country

        session.add(office)
        return office

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create_wallet(self, office_id: str, data: protocol.CreateOfficeWalletRequest):
        wallet = self.db.scalar(
            select(OfficeWallet)
            .where(OfficeWallet.office_id == office_id)
            .where(
                OfficeWallet.crypto_currency == data.crypto_currency,
                OfficeWallet.trading_currency == data.trading_currency,
            )
        )

        # create a new wallet

        wallet = OfficeWallet(
            office_id=office_id,
            crypto_currency=data.crypto_currency,
            trading_currency=data.trading_currency,
            walletID=str(uuid4()),
            wallet_name=data.wallet_name,
            initials=data.initials,
            wallet_type=(
                protocol.WalletType.SIMPLE
                if data.crypto_currency == protocol.CryptoCurrency.NA
                else protocol.WalletType.CRYPTO
            ),
        )

        self.db.add(wallet)
        return wallet

    def get_wallets(self, office_id: str) -> List[OfficeWallet]:
        """get all wallet for an office"""
        results = self.db.scalars(
            select(OfficeWallet).where(OfficeWallet.office_id == office_id)
        ).all()
        return results

    def get_health(self, office_id: str):
        """return office health"""
        acc_repo = AccountRepository(self.db)
        healthy = acc_repo.check_invariant(office_id)
        accounts = acc_repo.get_all_accounts(office_id)
        invariant = acc_repo.get_invariant(office_id)

        return protocol.OfficeHealth(
            status="healthy" if healthy else "unhealthy", accounts=accounts, invariant=invariant
        )

    def _get_start_of_day(self, today: datetime):
        return today.replace(hour=0, minute=0, second=0, microsecond=0)

    def _get_end_of_day(self, today: datetime):
        return today.replace(hour=23, minute=59, second=59)

    def get_daily_fund_commits(
        self, office_id: str, start_date_str: str | None, end_date_str: str | None
    ) -> List[FundCommit]:
        today = datetime.now()
        date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        if start_date_str is None:
            start = today
        else:
            # the date has this format 2024-07-31T22:00:00.000Z
            start = datetime.strptime(start_date_str, date_format)

        if end_date_str is None:
            end = today
        else:
            end = datetime.strptime(end_date_str, date_format)

        start_date = self._get_start_of_day(start)
        end_date = self._get_end_of_day(end)

        fund_commits = self.db.scalars(
            select(FundCommit, Activity)
            .join(Activity)
            .where(Activity.office_id == office_id)
            .where(FundCommit.date >= start_date)
            .where(FundCommit.date <= end_date)
            .order_by(FundCommit.date)
        ).all()

        return fund_commits
