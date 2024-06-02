from mkdi_backend.models.office import Office
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session


class OfficeRepository:
    def __init__(self, db):
        self.db: Session = db

    def get_all(self):
        return self.db.query(Office).all()

    def get_by_id(self, id):
        return self.db.get_by_id(id)

    def get_by_initials(self, initials: str):
        return self.db.query(Office).filter(Office.initials == initials).first()

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(self, input: protocol.CreateOfficeRequest, office_id: str):
        office: Office = (
            self.db.query(Office)
            .filter(Office.initials == input.initials and Office.organization_id == office_id)
            .first()
        )
        if office:
            raise MkdiError(
                f"Office {input.initials} already exists",
                error_code=MkdiErrorCode.OFFICE_EXISTS,
            )

        office = Office(
            initials=input.initials,
            name=input.name,
            country=input.country,
            organization_id=office_id,
        )
        self.db.add(office)
        return office

    def update(self, id, office):
        return self.db.update(id, office)

    def delete(self, id):
        return self.db.delete(id)
