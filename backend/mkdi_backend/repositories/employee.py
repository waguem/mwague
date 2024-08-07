from loguru import logger
from mkdi_backend.api.deps import KcUser
from mkdi_backend.authproviders import KeycloakAdminHelper, RoleProvider
from mkdi_backend.models.employee import Employee
from mkdi_backend.utils.database import CommitMode, async_managed_tx_method, managed_tx_method
from mkdi_backend.repositories.office import OfficeRepository
from mkdi_shared.exceptions.mkdi_api_error import MkdiError, MkdiErrorCode
from mkdi_shared.schemas import protocol as pr
from sqlmodel import Session, update, select
from sqlalchemy.ext.asyncio import AsyncSession

from typing import List


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

    def get_employee(self, username, email, organization_id) -> Employee:
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

    @async_managed_tx_method(auto_commit=CommitMode.COMMIT)
    async def create(
        self,
        *,
        auth_user: KcUser,
        usr_input: pr.CreateEmployeeRequest,
        office_id: str,
        organization_id: str,
    ):

        session: AsyncSession = self.db
        user = await session.scalar(select(Employee).where(Employee.username == usr_input.username))
        if user:
            raise MkdiError(
                f"Username {usr_input.username} already exists",
                error_code=MkdiErrorCode.USER_EXISTS,
            )

        office = await OfficeRepository(self.db).get_by_id(office_id)
        if not office:
            raise MkdiError("Office not found", error_code=MkdiErrorCode.NOT_FOUND)

        user = Employee(
            username=usr_input.username,
            email=usr_input.email,
            office_id=office.id,
            organization_id=organization_id,
            roles=[],
        )

        kc_admin = KeycloakAdminHelper()
        user_id = kc_admin.create_user(
            auth_user=auth_user, usr_input=usr_input, office_id=str(office.id)
        )
        user.provider_account_id = user_id

        # assing user roles
        assinged_roles = RoleProvider(kc_admin).update_user_roles(user_id, usr_input.roles)
        # update the user with the provider account id
        if len(assinged_roles) != len(usr_input.roles):
            raise MkdiError(
                f"Roles {usr_input.roles} are not valid roles",
                error_code=MkdiErrorCode.INVALID_ROLE,
            )
        user.roles = assinged_roles
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
        rprovider = RoleProvider()
        # update the user on keycloak
        assinged_roles = rprovider.update_user_roles(user.provider_account_id, data.roles)
        user.roles = assinged_roles
        user.email = data.email
        user.username = data.username
        self.db.add(user)
        return user

    @async_managed_tx_method(auto_commit=CommitMode.COMMIT)
    async def update_employees(
        self, user: KcUser, updated_users: pr.UpdateEmployeeListRequest
    ) -> List[pr.EmployeeResponse]:
        """update employee list"""
        # session: AsyncSession = self.db
        # get the list of users
        session: AsyncSession = self.db
        result = []
        for updated in updated_users.employees:
            # attempt to change the user roles

            await session.execute(
                update(Employee)
                .where(Employee.id == updated.id, Employee.office_id == user.office_id)
                .values(email=updated.email.lower(), roles=updated.roles)
            )
            u = (
                await session.execute(
                    select(Employee).where(
                        Employee.id == updated.id, Employee.office_id == user.office_id
                    )
                )
            ).scalar()
            rprovider = RoleProvider()
            updated_roles = rprovider.update_user_roles(u.provider_account_id, updated.roles)
            KeycloakAdminHelper().update_user(
                user_id=u.provider_account_id, data={"email": updated.email.lower()}
            )
            if len(updated_roles) != len(updated.roles):
                raise MkdiError(
                    f"Roles {updated.roles} are not valid roles",
                    error_code=MkdiErrorCode.INVALID_ROLE,
                )
            session.add(u)
            result.append(u)

        return result
