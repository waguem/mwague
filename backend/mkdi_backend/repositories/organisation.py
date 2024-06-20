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
    def create_organization(self, input: protocol.CreateOrganizationRequest):
        org: Organization = (
            self.db.query(Organization).filter(Organization.initials == input.initials).first()
        )
        if org:
            raise MkdiError(
                f"Organization {input.initials} already exists",
                error_code=MkdiErrorCode.ORGANIZATION_EXISTS,
            )

        org = Organization(
            initials=input.initials,
            org_name=input.org_name,
        )
        self.db.add(org)
        return org

    async def get_organizations(self):
        orgs = self.db.query(Organization).all()
        return orgs

    def get_my_organization(self, org_id: str):
        return self.db.query(Organization).filter(Organization.id == org_id).first()
