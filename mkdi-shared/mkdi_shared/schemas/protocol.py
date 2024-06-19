from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional
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


class AgentType(Enum):
    AGENT = "AGENT"
    SUPPLIER = "SUPPLIER"


class Currency(Enum):
    DOLLAR = "USD"
    EURO = "EUR"
    AED = "AED"
    CFA = "CFA"
    GNF = "GNF"
    RMB = "RMB"


class AccountType(Enum):
    AGENT = "AGENT"
    SUPPLIER = "SUPPLIER"
    OFFICE = "OFFICE"
    FUND = "FUND"


class AgentBase(SQLModel):
    name: str
    initials: str = Field(nullable=False, max_length=4, unique=True)
    email: str = Field(nullable=False, max_length=128, unique=True)
    phone: str = Field(nullable=False, max_length=16)
    country: str = Field(nullable=False, max_length=64)
    type: AgentType


class CreateAgentRequest(AgentBase):
    pass


class AgentResponse(AgentBase):
    pass


class AccountBase(SQLModel):
    balance: Decimal = Field(default=0, max_digits=5, decimal_places=3)
    version: int = Field(default=1)
    type: AccountType
    is_open: bool = Field(default=True)


class CreateAccountRequest(AccountBase):
    type: AccountType
    owner_id: UUID
    currency: Currency


class ActivityState(Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"


class ActivityBase(SQLModel):
    office_id: Decimal
    started_at: date
    state: ActivityState


class CreateAgentRequest(AgentBase):
    pass


class OfficeResponse(OfficeBase):
    id: UUID


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str
