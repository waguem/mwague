from loguru import logger
from mkdi_backend.authproviders import RoleProvider
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

    def get_office_employees(self, office_id: str, org_id: str):
        return (
            self.db.query(Employee)
            .filter(Employee.office_id == office_id and Employee.organization_id == org_id)
            .all()
        )

    def get_org_employees(self, organization_id: str):
        return self.db.query(Employee).filter(Employee.organization_id == organization_id).all()

    def get_employee(self, username, email, organization_id):
        return (
            self.db.query(Employee)
            .filter((Employee.username == username) | (Employee.email == email))
            .filter(Employee.organization_id == organization_id)
            .first()
        )

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def update_user_roles(self, org_id: str, username: str, roles: list[str]):
        user = self.get_by_username_with_id(org_id, username)

        if not user:
            raise MkdiError(f"User {username} not found", error_code=MkdiErrorCode.USER_NOT_FOUND)

        user.roles = roles
        self.db.add(user)
        return user

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

    def get_by_username_with_id(self, org_id: str, username: str) -> Employee:
        return (
            self.db.query(Employee)
            .filter(Employee.username == username and Employee.organization_id == org_id)
            .first()
        )

    def get_by_id(self, employee_id, org_id):
        return (
            self.db.query(Employee)
            .filter(Employee.id == employee_id and Employee.organization_id == org_id)
            .first()
        )

    def get_by_username(self, username: str) -> Employee:
        return self.db.query(Employee).filter(Employee.username == username).first()

    def get_by_email(self, email: str) -> Employee:
        return self.db.query(Employee).filter(Employee.email == email).first()

    @managed_tx_method(auto_commit=CommitMode.COMMIT)
    def update_employee(self, employee_id, organization_id, data):
        user: Employee = self.get_by_id(employee_id, organization_id)
        if not user:
            raise MkdiError(
                f"User {employee_id} not found", error_code=MkdiErrorCode.USER_NOT_FOUND
            )
        # make sure the roles are correct with the one from keycloak
        role_provider = RoleProvider()
        sys_roles = role_provider.get_roles()

        def hasMatch(role):
            return any([sys_role for sys_role in sys_roles if sys_role.startswith(role)])

        for role in data.roles:
            # check if the role is in the system roles by checking if there's a system role that starts with the role
            if not hasMatch(role):
                raise MkdiError(
                    f"Role {role} is not a valid role", error_code=MkdiErrorCode.INVALID_ROLE
                )
        # update the user on keycloak
        assinged_roles = role_provider.update_user_roles(user.provider_account_id, data.roles)
        user.roles = assinged_roles
        user.email = data.email
        user.username = data.username
        self.db.add(user)
        return user
