from typing import Annotated, List

from fastapi import APIRouter, Body, Depends, Security
from mkdi_backend.api.deps import KcUser, check_authorization, get_db
from mkdi_backend.repositories.office import OfficeRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()


@router.post("/organization/office", response_model=protocol.OfficeResponse, status_code=201)
def create_office(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["org_admin"])],
    create_office: Annotated[protocol.CreateOfficeRequest, Body(embed=True)],
    db: Session = Depends(get_db),
) -> protocol.OfficeResponse:
    """
    Create a new office.

    Args:
        user: The authenticated user making the request.
        create_office: The request payload containing the details of the office to be created.
        db: The database session.

    Returns:
        The response containing the created office details.

    """
    return OfficeRepository(db).create(create_office, organization_id=user.organization_id)


@router.get("/organization/office", status_code=200, response_model=List[protocol.OfficeResponse])
async def get_org_offices(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["org_admin"])],
    db: Session = Depends(get_db),
) -> List[protocol.OfficeResponse]:
    """
    Retrieve a list of offices for the organization.

    Args:
        user (KcUser): The authenticated user object.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        List[protocol.OfficeResponse]: A list of office responses.

    """
    return OfficeRepository(db).get_org_offices(user.organization_id)
