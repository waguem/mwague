from typing import Annotated, List

from fastapi import APIRouter, Depends, Security
from mkdi_backend.api.deps import KcUser, check_authorization, get_db
from mkdi_backend.repositories.employee import EmployeeRepository
from mkdi_shared.schemas import protocol
from sqlmodel import Session

router = APIRouter()

from loguru import logger


@router.post("/office/employee", response_model=protocol.EmployeeResponse, status_code=201)
def create_employee(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    db: Session = Depends(get_db),
):
    """
    Create a new employee.

    Args:
        user (KcUser): The authenticated user making the request.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        Employee: The created employee.

    """
    return EmployeeRepository(db).create(create_employee, organization_id=user.organization_id)


@router.get("/office/employee", status_code=200, response_model=List[protocol.EmployeeResponse])
def get_employees(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
):
    return EmployeeRepository(db).get_office_employees(user.office_id, user.organization_id)


@router.get(
    "/office/{office_id}/employee", status_code=200, response_model=List[protocol.EmployeeResponse]
)
def get_office_employees(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    office_id: str,
):
    return EmployeeRepository(db).get_office_employees(office_id, user.organization_id)


@router.get("/office/employee/me", status_code=200, response_model=protocol.EmployeeResponse)
def get_employee(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
) -> protocol.EmployeeResponse:
    return EmployeeRepository(db).get_employee(user.username, user.email, user.organization_id)
