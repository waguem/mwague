from typing import Dict, List
from uuid import UUID

from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode
from pydantic import BaseModel, Field, root_validator
from sqlmodel import SQLModel


class OrganizationBase(SQLModel):
    initials: str = Field(nullable=False, max_length=8, unique=True)
    org_name: str = Field(nullable=False, max_length=64)


class OrganizationResponse(OrganizationBase):
    id: str


class CreateOrganizationRequest(OrganizationBase):
    pass


class OfficeBase(SQLModel):
    country: str = Field(nullable=False, max_length=64)
    initials: str = Field(nullable=False, max_length=8, unique=True)
    name: str = Field(nullable=False, max_length=64)


class CreateOfficeRequest(OfficeBase):
    pass


class EmployeeBase(SQLModel):
    email: str = Field(nullable=False, max_length=128, unique=True)
    username: str = Field(nullable=False, max_length=128, unique=True)


class CreateEmployeeRequest(EmployeeBase):
    office_id: UUID
    roles: List[str]
    password: str


class EmployeeResponse(EmployeeBase):
    id: UUID
    office_id: UUID
    organization_id: UUID
    roles: List[str]

    @root_validator(pre=True)
    def transform_roles(cls, values) -> Dict:
        """
        str format {role_admin,role_user}
        transform to list format [soft_admin_0,org_admin_1]
        """
        roles = values.get("roles")
        transformed = dict(values)
        if isinstance(roles, str):
            transformed["roles"] = roles[1 : len(roles) - 1].split(",")
            # remove curly braces remote _1 at the end
        return transformed


class OfficeResponse(OfficeBase):
    id: UUID


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str
