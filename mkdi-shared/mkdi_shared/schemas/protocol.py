# pyling: disable-all
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated, Dict, List, Literal, Optional, Union, Mapping, Any
from uuid import UUID, uuid4
import json
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode
from pydantic import BaseModel, Field, root_validator
from sqlmodel import Field as SQLModelField
from sqlmodel import SQLModel
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy import event


def custom_serializer(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, UUID):
        return str(obj)
    # if string
    return obj


class OrganizationBase(SQLModel):
    initials: str = Field(nullable=False, max_length=8, unique=True)
    org_name: str = Field(nullable=False, max_length=64)


class OrganizationResponse(OrganizationBase):
    id: UUID


class CreateOrganizationRequest(OrganizationBase):
    pass


class OfficeBase(SQLModel):
    country: str = Field(nullable=False, max_length=64)
    initials: str = Field(nullable=False, max_length=8, unique=True)
    name: str = Field(nullable=False, max_length=64)


class OfficeResponse(OfficeBase):
    id: UUID
    currencies: dict | list[dict] | None = None


class CreateOfficeRequest(OfficeBase):
    pass


class EmployeeBase(SQLModel):
    email: str = Field(nullable=False, max_length=128, unique=True)
    username: str = Field(nullable=False, max_length=128, unique=True)


class CreateEmployeeRequest(EmployeeBase):
    office_initials: str
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


class EmployeeResponseComplete(EmployeeResponse):
    office: OfficeResponse


class AgentType(Enum):
    AGENT = "AGENT"
    SUPPLIER = "SUPPLIER"


class Currency(Enum):
    USD = "USD"
    EUR = "EUR"
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
    # office_id can be passed or not, if set the user must be an org_admin
    pass


class VariationType(Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"


class TransactionCommit(BaseModel):
    balance: float
    amount: float
    initials: str
    variation: str

    def to_json(self):
        return json.dumps(self.dict(), ensure_ascii=False, default=custom_serializer)


class AgentResponse(AgentBase):
    pass


class AccountBase(SQLModel):
    type: AccountType
    currency: Currency
    initials: str = SQLModelField(nullable=False, max_length=4, unique=True)
    balance: Decimal = Field(default=0, max_digits=5, decimal_places=3, nullable=True)

    def credit(self, amount: Decimal) -> TransactionCommit:
        commit = self.get_commit(amount, VariationType.CREDIT)
        self.balance += amount
        return commit

    def debit(self, amount: Decimal) -> TransactionCommit:
        commit = self.get_commit(amount, VariationType.DEBIT)
        self.balance -= amount
        return commit

    def get_commit(self, amount: Decimal, variation: VariationType) -> TransactionCommit:
        return TransactionCommit(
            balance=self.balance, amount=amount, initials=self.initials, variation=variation.value
        )


class CreateAccountRequest(AccountBase):
    owner_initials: str


class AccountResponse(AccountBase):
    balance: Decimal
    is_open: bool
    version: int
    created_by: UUID | None = None
    office_id: UUID | None = None


class AgentReponseWithAccounts(AgentBase):
    accounts: List[AccountResponse] | None = []


class ActivityState(Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"


class ActivityBase(SQLModel):
    started_at: date
    state: ActivityState


class ActivityResponse(ActivityBase):

    openning_fund: Decimal
    closing_fund: Decimal | None
    openning_rate: dict | None
    closing_rate: dict | None


class Rate(BaseModel):
    currency: str
    rate: Annotated[Decimal, Field(strict=True, gt=0)]


class CreateActivityRequest(BaseModel):
    rates: List[Rate]


class TransactionState(Enum):
    REVIEW = "REVIEW"
    PENDING = "PENDING"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class TransactionType(Enum):
    DEPOSIT = "DEPOSIT"
    INTERNAL = "INTERNAL"


class PaymentMethod(Enum):
    CASH = "CASH"
    BANK = "BANK"
    MOBILE = "MOBILE"


class Note(BaseModel):
    content: str
    created_by: str
    created_at: str


class NoteList(BaseModel):
    notes: List[Note] = []


class TransactionBase(SQLModel):
    amount: Annotated[Decimal, Field(strict=True, ge=0)]
    rate: Annotated[Decimal, Field(strict=True, gt=0)]
    code: Annotated[str, SQLModelField(max_length=64, nullable=False, unique=True)]
    state: TransactionState
    type: TransactionType
    created_at: Annotated[datetime, Field(default_factory=datetime.now)]


class TransactionResponse(TransactionBase):
    charges: Annotated[Decimal, Field(strict=True, ge=0)] | None
    notes: NoteList


class TransactionDB(TransactionBase):
    """Transaction database model"""

    id: Optional[UUID] = SQLModelField(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    office_id: UUID = SQLModelField(foreign_key="offices.id")
    org_id: UUID = SQLModelField(foreign_key="organizations.id")
    created_by: UUID = SQLModelField(foreign_key="employees.id")

    history: Mapping[Any, Mapping | Any] = SQLModelField(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )
    notes: Mapping[Any, Mapping | Any] = SQLModelField(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )

    def to_response(self) -> TransactionResponse:
        return TransactionResponse(**self.dict())

    def save_commit(self, commits: List[TransactionCommit]) -> None:
        """save the commits to the history"""
        # load jsonb from self.history
        hist = self.history.copy()
        if "history" not in hist:
            hist["history"] = []
        item = {}
        item["commits"] = [item.dict() for item in commits]
        hist["history"].append(item)

        self.history = hist

    def add_note(self, note: Note) -> None:
        notes = {"notes": []}
        if "notes" not in self.notes:
            notes["notes"] = [note for note in self.notes["notes"]]

        notes["notes"].append(note.dict())
        self.notes = notes
        return self.notes


class Amount(BaseModel):
    """Amount and rate of a transaction."""

    amount: Annotated[Decimal, Field(strict=True, ge=0)]
    rate: Annotated[Decimal, Field(strict=True, ge=0)]


class InternalRequest(BaseModel):
    """Internal transaction request."""

    type: Literal["INTERNAL"]
    sender: str
    receiver: str


class DepositRequest(BaseModel):
    type: Literal["DEPOSIT"]
    receiver: str


class ValidationState(Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class TransactionRequest(BaseModel):
    currency: Currency
    amount: Amount
    charges: Amount | None

    data: Union[InternalRequest, DepositRequest] = Field(..., discriminator="type")


class TransactionReviewReq(TransactionRequest):
    code: str
    type: TransactionType
    state: Annotated[ValidationState, Field(nullable=False)]
    notes: str | None


class CancelRequest(BaseModel):
    code: str
    reason: str


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str


# @event.listens_for(TransactionDB.history, "modified")
# def modified_json(instance, initiator):
#     print("json value modified:", instance.data)
