from mkdi_backend.models import Organization
from mkdi_backend.utils.database import CommitMode, async_managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from sqlmodel import Session


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    @async_managed_tx_method(auto_commit=CommitMode.COMMIT)
    async def create_organization(self, input):
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
