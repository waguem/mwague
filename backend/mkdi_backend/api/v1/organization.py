from typing import Annotated, List

from fastapi import APIRouter, Body, Depends
from loguru import logger
from mkdi_backend.api.deps import get_db, get_user_info
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.organisation import OrganizationRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()


@router.post("/organization", response_model=protocol.OrganizationResponse, status_code=201)
async def create_organization(
    *,
    user: KcUser = Depends(get_user_info),
    create_org: Annotated[protocol.CreateOrganizationRequest, Body(embed=True)],
    db: Session = Depends(get_db),
):
    org_repo = OrganizationRepository(db)
    repo = await org_repo.create_organization(create_org)
    return repo


@router.get("/organization", response_model=List[protocol.OrganizationResponse], status_code=200)
async def get_organizations(
    *,
    user: KcUser = Depends(get_user_info),
    db: Session = Depends(get_db),
):
    org_repo = OrganizationRepository(db)
    repo = await org_repo.get_organizations()
    return repo


@router.get("/organization/me", response_model=protocol.OrganizationResponse, status_code=200)
def get_my_organization(
    *,
    user: KcUser = Depends(get_user_info),
    db: Session = Depends(get_db),
):
    return OrganizationRepository(db).get_my_organization(user.organization_id)
