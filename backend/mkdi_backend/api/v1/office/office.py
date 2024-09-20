from typing import Annotated, List

from fastapi import APIRouter, Body, Depends, HTTPException, Security, status
from sqlmodel import Session

from mkdi_shared.schemas import protocol
from mkdi_backend.api.deps import (
    check_authorization,
    get_db,
    get_user_info,
    AsyncDBSessionDep,
    hasSufficientPermissions,
)

from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.office import OfficeRepository
from mkdi_backend.models.Activity import FundCommit

router = APIRouter()


@router.post("/organization/office", response_model=protocol.OfficeResponse, status_code=201)
def create_office(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["org_admin"])],
    request: Annotated[protocol.CreateOfficeRequest, Body(embed=True)],
    db: Session = Depends(get_db),
) -> protocol.OfficeResponse:
    """
    Create a new office.

    Args:
        user: The authenticated user making the request.
        request: The request payload containing the details of the office to be created.
        db: The database session.

    Returns:
        The response containing the created office details.

    """
    return OfficeRepository(db).create(request, organization_id=user.organization_id)


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
    "/organization/myoffice",
    status_code=200,
    response_model=protocol.OfficeResponse,
)
def get_my_office(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    db: Session = Depends(get_db),
) -> protocol.OfficeResponse:
    """return the office of the authenticated user"""
    return OfficeRepository(db).get_office(user.office_id, user.organization_id)


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


@router.post(
    "/organization/office/wallet",
    status_code=201,
    response_model=protocol.OfficeWalletResponse,
)
def create_wallet(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    data: protocol.CreateOfficeWalletRequest,
    db: Session = Depends(get_db),
) -> protocol.OfficeWalletResponse:
    """create a new wallet for an office"""
    return OfficeRepository(db).create_wallet(user.office_id, data)


@router.get(
    "/organization/office/wallet",
    status_code=200,
    response_model=List[protocol.OfficeWalletResponse],
)
def get_wallets(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    db: Session = Depends(get_db),
) -> List[protocol.OfficeWalletResponse]:
    """return all wallets for an office"""
    return OfficeRepository(db).get_wallets(user.office_id)


@router.get(
    "/organization/health",
    status_code=200,
    response_model=protocol.OfficeHealth,
)
def get_office_health(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    db: Session = Depends(get_db),
) -> protocol.OfficeHealth:
    """return the health of the office"""
    return OfficeRepository(db).get_health(user.office_id)


@router.get("/organization/myoffice/fund_commits", status_code=200, response_model=List[FundCommit])
def get_fund_commits(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
) -> List[FundCommit]:
    """return all daily fund commits for an office"""
    return OfficeRepository(db).get_daily_fund_commits(user.office_id, start_date, end_date)
