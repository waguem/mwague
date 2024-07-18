from typing import Annotated, List

from fastapi import APIRouter, Body, Depends, HTTPException, Security, status
from mkdi_backend.api.deps import (
    check_authorization,
    get_db,
    get_user_info,
    AsyncDBSessionDep,
    hasSufficientPermissions,
)
from mkdi_backend.models.models import KcUser
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


@router.get(
    "/organization/office/{office_id}", status_code=200, response_model=protocol.OfficeResponse
)
def get_office(
    *,
    user: Annotated[KcUser, Depends(get_user_info)],
    office_id: str,
    db: Session = Depends(get_db),
) -> protocol.OfficeResponse:
    """
    Retrieve an office by ID.

    Args:
        user (KcUser): The authenticated user object.
        office_id (int): The ID of the office to retrieve.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        protocol.OfficeResponse: The office response.

    """
    # if a user is trying to read a diffrent office than his own
    # then that user should be at least an org_admin
    if user.office_id != office_id and not hasSufficientPermissions(user.roles, ["org_admin"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not have enough permissions to access this resource.",
        )

    return OfficeRepository(db).get_office(office_id, user.organization_id)


@router.put(
    "/organization/office/{office_id}",
    status_code=200,
    response_model=protocol.OfficeResponse,
)
async def update_office(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    office_id: str,
    data: protocol.UpdateOffice,
    db: AsyncDBSessionDep,
) -> protocol.OfficeResponse:
    """
    Update an office by ID.

    Args:
        user (KcUser): The authenticated user object.
        office_id (int): The ID of the office to update.
        data (protocol.UpdateOfficeRequest): The data to update the office with.
        db (AsyncDBSessionDep): The database session.

    Returns:
        protocol.OfficeResponse: The updated office response.
    """
    return await OfficeRepository(db).update_office(user, office_id, data)
