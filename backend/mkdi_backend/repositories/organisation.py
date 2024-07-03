from mkdi_backend.models import Organization
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol
from sqlmodel import Session


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_initials(self, initials: str):
        return self.db.query(Organization).filter(Organization.initials == initials).first()

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create_organization(self, usr_input: protocol.CreateOrganizationRequest):
        org: Organization = (
            self.db.query(Organization).filter(Organization.initials == usr_input.initials).first()
        )
        if org:
            raise MkdiError(
                f"Organization {usr_input.initials} already exists",
                error_code=MkdiErrorCode.ORGANIZATION_EXISTS,
            )

        org = Organization(
            initials=usr_input.initials,
            org_name=usr_input.org_name,
        )
        self.db.add(org)
        return org

    async def get_organizations(self):
        orgs = self.db.query(Organization).all()
        return orgs

    def get_my_organization(self, org_id: str):
        return self.db.query(Organization).filter(Organization.id == org_id).first()
