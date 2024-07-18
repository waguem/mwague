from mkdi_backend.models.models import KcUser
from mkdi_backend.models.office import Office
from mkdi_backend.utils.database import CommitMode, managed_tx_method, async_managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
from copy import deepcopy


class OfficeRepository:
    def __init__(self, db):
        self.db: Session = db

    def get_org_offices(self, organization_id: str):
        return self.db.query(Office).filter(Office.organization_id == organization_id).all()

    def get_all(self):
        return self.db.query(Office).all()

    def get_by_initials(self, initials: str):
        return self.db.query(Office).filter(Office.initials == initials).first()

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(self, usr_input: protocol.CreateOfficeRequest, organization_id: str):
        office: Office = (
            self.db.query(Office)
            .filter(
                Office.initials == usr_input.initials and Office.organization_id == organization_id
            )
            .first()
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

    def update(self, id, office):
        return self.db.update(id, office)

    def delete(self, id):
        return self.db.delete(id)

    def get_office(self, office_id: str, organization_id: str):
        return (
            self.db.query(Office)
            .filter(Office.id == office_id and Office.organization_id == organization_id)
            .first()
        )

    async def get_by_id(self, office_id) -> Office | None:
        """return office by id"""
        session: AsyncSession = self.db
        return await session.scalar(select(Office).where(Office.id == office_id))

    @async_managed_tx_method(auto_commit=CommitMode.COMMIT)
    async def update_office(self, user: KcUser, office_id: str, data: protocol.UpdateOffice):
        office = await self.get_by_id(office_id)
        if not office:
            raise MkdiError(
                f"Office with id {office_id} not found", error_code=MkdiErrorCode.NOT_FOUND
            )

        if not (data.name or data.baseCurrency or data.currencies or data.country):
            return office
        # update the office
        if data.name:
            office.name = data.name
        currencies = office.currencies

        if data.baseCurrency:
            # check if the base currency is in the currencies list
            item = next((item for item in currencies if item["name"] == data.baseCurrency), None)
            if not item:
                raise MkdiError(
                    f"Currency {data.baseCurrency} not found",
                    error_code=MkdiErrorCode.INVALID_CURRENCY,
                )

            curr_copy = deepcopy(currencies)
            currencies.clear()
            for currency in curr_copy:
                currency["main"] = currency["name"] == data.baseCurrency
                currencies.append(currency)

        if data.currencies:
            main = next((item for item in currencies if item["main"]), None)
            office.currencies.clear()
            for currency in data.currencies:
                currencies.append(
                    {
                        "name": currency,
                        "main": main["name"] == currency if main else False,
                        "defaultRate": 1.0,
                    }
                )

        if data.country:
            office.country = data.country
        session: AsyncSession = self.db

        session.add(office)
        return office
