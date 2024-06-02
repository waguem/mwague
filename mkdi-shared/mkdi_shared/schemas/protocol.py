from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode
from pydantic import BaseModel, Field
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
    pass


class OfficeResponse(OfficeBase):
    pass


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str
