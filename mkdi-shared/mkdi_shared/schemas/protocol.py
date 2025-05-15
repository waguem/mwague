# pyling: disable-all
from datetime import date, datetime
from decimal import Decimal, ROUND_UP
from enum import Enum, auto
from typing import Annotated, List, Literal, Optional, Union, Mapping, Any
from uuid import UUID, uuid4
import json
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.exceptions.mkdi_api_error import MkdiErrorCode, MkdiError
from pydantic import BaseModel, Field
from sqlmodel import Field as SQLModelField
from sqlmodel import SQLModel
from sqlalchemy.ext.mutable import MutableDict, MutableList


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


class EmployeeBase(SQLModel):
    email: str = SQLModelField(nullable=False, max_length=128, unique=True)
    username: str = SQLModelField(nullable=False, max_length=128, unique=True)


class CreateEmployeeRequest(EmployeeBase):
    office_id: str
    roles: List[str]
    password: str


class EmployeeResponse(EmployeeBase):
    id: UUID
    office_id: UUID
    organization_id: UUID
    roles: List[str]
    avatar_url: str | None = None


class AgentType(Enum):
    AGENT = "AGENT"
    SUPPLIER = "SUPPLIER"


class TransactionType(Enum):
    # direct transaction
    DEPOSIT = "DEPOSIT"
    INTERNAL = "INTERNAL"
    # pending payment
    EXTERNAL = "EXTERNAL"
    SENDING = "SENDING"
    # ForEx
    FOREX = "FOREX"
    TRADING = "TRADING"


class Currency(Enum):
    USD = "USD"
    EUR = "EUR"
    AED = "AED"
    CFA = "CFA"
    GNF = "GNF"
    RMB = "RMB"


class CryptoCurrency(Enum):
    BITCOINT = "BTC"
    ETHEREUM = "ETH"
    USDT = "USDT"  # Tether
    NA = "NA"


class TradingType(Enum):
    BUY = "BUY"
    SELL = "SELL"
    SIMPLE_SELL = "SIMPLE SELL"
    DEPOSIT = "DEPOSIT"
    EXCHANGE = "EXCHANGE"
    EXCHANGE_WITH_SIMPLE_WALLET = "EXCHANGE WITH SIMPLE WALLET"


class PaymentMethod(Enum):
    CASH = "CASH"
    BANK = "BANK"
    MOBILE = "MOBILE"


class AccountType(Enum):
    AGENT = "AGENT"
    SUPPLIER = "SUPPLIER"
    OFFICE = "OFFICE"
    FUND = "FUND"


class PaymentState(Enum):
    PAID = auto()
    CANCELLED = auto()


class PaymentBase(SQLModel):
    payment_date: date
    amount: Annotated[Decimal, Field(strict=True, ge=0)]
    transaction_id: UUID
    transaction_type: TransactionType
    paid_by: UUID
    state: PaymentState
    notes: Mapping[Any, Mapping | Any] = SQLModelField(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )


class WalletType(Enum):
    CRYPTO = "CRYPTO"
    SIMPLE = "SIMPLE"


class CryptoWalletBase(SQLModel):
    # the crypto currency used in the wallet to buy
    # the trading currency
    crypto_currency: CryptoCurrency
    # this currency is used for trading
    trading_currency: Currency
    wallet_name: str | None
    initials: str | None
    wallet_type: WalletType | None


class CreateOfficeWalletRequest(CryptoWalletBase):
    pass


class OfficeWalletResponse(CryptoWalletBase):
    walletID: str
    crypto_balance: Decimal
    trading_balance: Decimal
    value: Decimal
    pending_in: Decimal
    pending_out: Decimal
    pending_payment: Decimal
    office_id: UUID


class PaymentResponse(PaymentBase):
    paid_by: UUID | None


class AgentBase(SQLModel):
    name: str
    initials: str = Field(nullable=False, max_length=4, unique=True)
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
    balance: Decimal = Field(default=0, decimal_places=3, nullable=True)

    def credit(self, amount: Decimal) -> TransactionCommit:
        commit = self.get_commit(amount, VariationType.CREDIT)
        self.balance += amount
        self.balance = self.balance.quantize(Decimal(".001"), rounding=ROUND_UP)
        return commit

    def debit(self, amount: Decimal) -> TransactionCommit:
        commit = self.get_commit(amount, VariationType.DEBIT)
        self.balance -= amount
        self.balance = self.balance.quantize(Decimal(".001"), rounding=ROUND_UP)
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
    pendings_in: Decimal | None
    pendings_out: Decimal | None
    effective_balance: Decimal | None
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


class Amount(BaseModel):
    """Amount and rate of a transaction."""

    amount: Annotated[Decimal, Field(strict=True, ge=0)]
    rate: Annotated[Decimal, Field(strict=True, ge=0)]


class ValidationState(Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class InternalRequest(BaseModel):
    """Internal transaction request."""

    type: Literal["INTERNAL"]
    sender: str
    receiver: str
    tags: str | None


class CustomerDetails(BaseModel):
    name: str
    phone: str


class ExternalRequest(BaseModel):
    type: Literal["EXTERNAL"]
    sender: str
    customer: Optional[CustomerDetails] = None
    payment_currency: Currency
    tags: str | None


class SendingRequest(BaseModel):
    type: Literal["SENDING"]
    receiver_initials: str
    payment_method: PaymentMethod
    payment_currency: Currency


class ForExRequest(BaseModel):
    type: Literal["FOREX"]
    provider_account: str
    customer_account: str
    tag: str
    currency: Currency
    base_currency: Currency
    daily_rate: Annotated[Decimal, Field(strict=True, gt=0)]
    bank_rate: Annotated[Decimal, Field(strict=False, ge=0)]
    bank_fees: Annotated[Decimal, Field(strict=False, ge=0)]
    buying_rate: Annotated[Decimal, Field(strict=True, gt=0)]
    selling_rate: Annotated[Decimal, Field(strict=True, gt=0)]
    amount: Annotated[Decimal, Field(strict=True, ge=0)]


class PaymentRequest(BaseModel):
    amount: Annotated[Decimal, Field(strict=True, ge=0)]
    rate: Annotated[Decimal, Field(strict=True, ge=0)]
    payment_type: TransactionType
    customer: Optional[CustomerDetails] = None
    notes: str | None


class DepositRequest(BaseModel):
    type: Literal["DEPOSIT"]
    receiver: str


class TransactionRequest(BaseModel):
    currency: Currency | None
    amount: Amount
    charges: Amount | None

    message: str | None
    tags: str | None

    transaction_type: Optional[TransactionType] = None

    data: Optional[
        Union[InternalRequest, DepositRequest, ExternalRequest, SendingRequest, ForExRequest]
    ] = Field(default=None, discriminator="type")


class TransactionState(Enum):
    INIT = "INIT"
    REVIEW = "REVIEW"
    PENDING = "PENDING"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class OfficeBase(SQLModel):
    country: str = Field(nullable=False, max_length=64)
    initials: str = Field(nullable=False, max_length=8, unique=True)
    name: str = Field(nullable=False, max_length=64)


class OfficeResponse(OfficeBase):
    id: UUID
    currencies: dict | list[dict] | None = None
    wallets: List[OfficeWalletResponse] | None = None


class EmployeeResponseComplete(EmployeeResponse):
    office: OfficeResponse


class CreateOfficeRequest(OfficeBase):
    default_rates: List[Rate]


class AccountReportItem(BaseModel):
    created_at: datetime
    amount: Decimal
    type: TransactionType
    converted: Decimal
    code: str
    state: TransactionState
    description: str
    is_out: bool


class Note(BaseModel):
    date: str
    message: str
    type: str
    user: str | None
    tags: List[str] | None


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
    notes: str | None


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
    reviwed_by: Optional[UUID] = SQLModelField(foreign_key="employees.id", nullable=True)

    history: Mapping[Any, Mapping | Any] = SQLModelField(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )

    notes: str = Field(default="[]", nullable=False)

    def to_response(self) -> TransactionResponse:
        return TransactionResponse(**self.dict())

    def save_commit(self, commits: List[TransactionCommit]) -> None:
        """save the commits to the history"""
        # load jsonb from self.history
        if not ("history" in self.history and isinstance(self.history, list)):
            self.history["history"] = []
        item = {}
        item["commits"] = commits
        self.history["history"].append(item)

    def add_note(self, note: Note) -> None:
        notes = {"notes": []}
        if "notes" not in self.notes:
            notes["notes"] = [note for note in self.notes["notes"]]

        notes["notes"].append(note.dict())
        self.notes = notes
        return self.notes

    def report(self, is_out: bool = False) -> AccountReportItem:

        def get_request_message(self) -> str:
            notes = json.loads(self.notes)
            request = next((note for note in notes if note["type"] == "REQUEST"), None)
            if request:
                return request["message"]
            return ""

        return AccountReportItem(
            amount=self.amount,
            code=self.code,
            converted=self.amount * self.rate,
            created_at=self.created_at,
            is_out=is_out,
            state=self.state,
            type=self.type,
            description=get_request_message(self),
        )

    def update(self, request: TransactionRequest):
        valid_states = [
            TransactionState.PENDING,
            TransactionState.REVIEW,
            TransactionState.REJECTED,
        ]

        if not self.state in valid_states:
            raise MkdiError(
                error_code=MkdiErrorCode.INVALID_STATE,
                message=f"Cannot update {self.state} transaction",
            )

        self.amount = request.amount.amount
        if hasattr(self, "charges") and request.charges:
            setattr(self, "charges", request.charges.amount)

        self.state = TransactionState.REVIEW


class WalletTradingBase(SQLModel):
    code: str | None = Field(nullable=False, max_length=16, unique=True)
    walletID: str = SQLModelField(foreign_key="wallets.walletID")
    trading_currency: str | Currency | None
    exchange_currency: str | Currency | None
    selling_currency: str | Currency | None
    trading_type: TradingType
    amount: Annotated[Decimal, Field(strict=True, ge=0)]
    daily_rate: Annotated[Decimal, Field(strict=True, gt=0, max_digits=12, decimal_places=6)]
    trading_rate: Annotated[Decimal, Field(strict=True, ge=0, max_digits=11, decimal_places=6)]


class BuyRequest(BaseModel):
    request_type: Literal["BUY"]
    provider: str


class WalletDepositRequest(BaseModel):
    request_type: Literal["DEPOSIT"]
    provider: str


class SellRequest(BaseModel):
    request_type: Literal["SELL"]
    customer: str
    currency: Currency | CryptoCurrency


class ExchangeRequest(BaseModel):
    request_type: Literal["EXCHANGE"]
    exchange_rate: Annotated[Decimal, Field(strict=True, gt=0)]
    walletID: str


class ExchangeWithSimpleWalletRequest(BaseModel):
    request_type: Literal["EXCHANGE WITH SIMPLE WALLET"]
    walletID: str
    exchange_rate: Annotated[Decimal, Field(strict=True, gt=0)]
    selling_rate: Annotated[Decimal, Field(strict=True, gt=0)]


class WalletTradingRequest(WalletTradingBase):
    message: str | None
    request: Union[
        BuyRequest,
        SellRequest,
        ExchangeRequest,
        ExchangeWithSimpleWalletRequest,
        WalletDepositRequest,
    ] = Field(discriminator="request_type")


class WalletTradingResponse(WalletTradingBase):
    id: UUID
    state: TransactionState
    created_by: UUID
    created_at: datetime
    reviwed_by: UUID | None
    wallet_value: Annotated[Decimal, Field(strict=True, ge=0)]
    wallet_crypto: Annotated[Decimal, Field(strict=True, ge=0)]
    wallet_trading: Annotated[Decimal, Field(strict=True, ge=0)]
    partner_paid: bool | None

    trading_cost: Annotated[Decimal, Field(strict=True, ge=0)]
    trading_amount: Annotated[Decimal, Field(strict=True, ge=0)]
    trading_crypto: Annotated[Decimal, Field(strict=True, ge=0)]
    trading_result: Annotated[Decimal, Field()]
    trading_exchange: Annotated[Decimal, Field()]

    account: str | None
    exchange_rate: Annotated[Decimal | None, Field(strict=True, gt=0)]
    selling_rate: Annotated[Decimal | None, Field(strict=True, gt=0)]

    exchange_walletID: str | None

    notes: List[Mapping[Any, Mapping | Any]] | None

    payments: List[PaymentBase]


class TransactionReviewReq(TransactionRequest):
    code: str
    type: TransactionType
    state: Annotated[ValidationState, Field(nullable=False)]
    notes: str | None


class TradeReviewReq(WalletTradingBase):
    tags: List[str]
    review: Annotated[ValidationState, Field(nullable=False)]


class CancelTransaction(BaseModel):
    reason: List[str]
    description: str
    code: str
    type: TransactionType


class MkdiErrorResponse(BaseModel):
    """The format of an error response from the OASST API."""

    error_code: MkdiErrorCode
    message: str


class UpdateEmployeeListRequest(BaseModel):
    """Update employee list request."""

    employees: List[EmployeeResponse]


class UpdateOffice(BaseModel):
    name: Optional[str]
    country: Optional[str]
    currencies: Optional[list[str]]
    baseCurrency: Optional[str]
    mainCurrency: Optional[str]


class OfficeHealth(BaseModel):
    """Offic health response."""

    status: Literal["healthy"] | Literal["unhealthy"]
    invariant: Decimal
    accounts: List[AccountResponse]


class ResultType(Enum):
    """Result type."""

    CHARGE = "CHARGE"
    BENEFIT = "BENEFIT"
    LOSS = "LOSS"
    EXPENSE = "EXPENSE"


class OfficeResult(BaseModel):
    """Office result."""

    result_source: TransactionType
    amount: Decimal
    code: str
    tag: str | None
    state: TransactionState
    result_type: ResultType
    date: datetime
    transaction_id: UUID


class ReportResponse(BaseModel):
    """Monthly report response."""

    results: List[OfficeResult]


class DateRange(BaseModel):
    """Date range."""

    start_date: datetime
    end_date: datetime


class ReportItem(BaseModel):
    """Report item."""

    created_at: datetime
    amount: Decimal
    converted: Decimal
    type: TransactionType
    state: TransactionState
    code: str
    description: str


class AccountMonthlyReportBase(SQLModel):
    """Account monthly report."""

    account: str  # ///< Account initials
    start_date: datetime
    end_date: datetime
    is_open: bool  # ///< report status
    start_balance: Decimal
    end_balance: Decimal


class CommitTradeRequest(BaseModel):
    """Commit trade request."""

    walletID: str
    tradeID: str
    trading_rate: Decimal
    amount: Decimal
    trading_cost: Decimal
    sold_amount: Decimal
    crypto_amount: Decimal
    trading_result: Decimal


class GroupedPaymentItem(BaseModel):
    code: str
    request: PaymentRequest


class GroupPayRequest(BaseModel):
    payments: List[GroupedPaymentItem]


class GroupPayResponseItem(BaseModel):
    code: str
    state: PaymentState


class GroupPayResponse(BaseModel):
    states: List[GroupPayResponseItem]


class AccountMonthlyReportResponse(AccountMonthlyReportBase):
    pendings: Decimal
    updated_at: datetime
    reports: List[AccountReportItem]
