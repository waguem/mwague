"""Employee API endpoints."""

from typing import Annotated, List

from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from mkdi_backend.api.deps import check_authorization, get_db, AsyncDBSessionDep
from mkdi_backend.models.models import KcUser
from mkdi_backend.repositories.employee import EmployeeRepository
from mkdi_shared.schemas import protocol


router = APIRouter()


@router.post("/office/employee", response_model=protocol.EmployeeResponse, status_code=201)
async def create_employee(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    user_input: protocol.CreateEmployeeRequest,
    db: AsyncDBSessionDep,
):
    """
    Create a new employee.

    Args:
        user (KcUser): The authenticated user making the request.
        input (protocol.CreateEmployeeRequest): The input data for creating the employee.
    Returns:
        Employee: The created employee.

    """
    return await EmployeeRepository(db).create(
        auth_user=user,
        usr_input=user_input,
        office_id=user_input.office_id,
        organization_id=user.organization_id,
    )


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


@router.get(
    "/office/employee/me", status_code=200, response_model=protocol.EmployeeResponseComplete
)
def get_employee(
    *,
    db: Session = Depends(get_db),
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
) -> protocol.EmployeeResponseComplete:
    emp = EmployeeRepository(db).get_employee(user.username, user.email, user.organization_id)
    return emp


@router.put("/office/employee/{employee_id}/assign", status_code=200)
def update_employee(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=["office_admin"])],
    employee_id: str,
    data: protocol.EmployeeResponse,
    db: Session = Depends(get_db),
) -> protocol.EmployeeResponse:
    return EmployeeRepository(db).update_employee(employee_id, user.organization_id, data)


@router.put("/office/employee")
async def update_office_employees(
    *,
    user: Annotated[KcUser, Security(check_authorization, scopes=[])],
    updated_users: protocol.UpdateEmployeeListRequest,
    db: AsyncDBSessionDep,
) -> List[protocol.EmployeeResponse]:
    """update list of employees"""
    return await EmployeeRepository(db).update_employees(user=user, updated_users=updated_users)
