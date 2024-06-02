from mkdi_backend.models.employee import Employee
from mkdi_backend.utils.database import CommitMode, managed_tx_method
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas.protocol import CreateEmployeeRequest
from sqlmodel import Session


class EmployeeRepository:
    """
    Repository for managing Employee
    """

    def __init__(self, db: Session):
        self.db = db

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def create(self, *, input: CreateEmployeeRequest, office_id: str, organization_id: str):
        user: Employee = (
            self.db.query(Employee)
            .filter(Employee.username == input.username and Employee.office_id == office_id)
            .first()
        )
        if user:
            raise MkdiError(
                f"Username {input.username} already exists", error_code=MkdiErrorCode.USER_EXISTS
            )

        user = Employee(
            username=input.username,
            email=input.email,
            office_id=office_id,
            organization_id=organization_id,
        )
        self.db.add(user)
        return user

    def get_by_username(self, username: str) -> Employee:
        return self.db.query(Employee).filter(Employee.username == username).first()

    def get_by_email(self, email: str) -> Employee:
        return self.db.query(Employee).filter(Employee.email == email).first()
