"""Transactions models"""

from datetime import datetime
import dataclasses

from decimal import Decimal, getcontext
from typing import Annotated, Mapping, Any, Optional, Union, List, ClassVar
from uuid import UUID, uuid4
from sqlalchemy.ext.mutable import MutableDict, MutableList
from pydantic import Field as PydanticField
from mkdi_shared.schemas import protocol as pr
from sqlmodel import Field, SQLModel, Session, select
from sqlalchemy.ext.hybrid import hybrid_property
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_backend.database import engine


class Payment(pr.PaymentBase, table=True):
    __tablename__ = "payments"
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    paid_by: UUID = Field(foreign_key="employees.id")


class Internal(pr.TransactionDB, table=True):
    __tablename__ = "internals"

    """
      An internal transaction is made between two accounts domiciled in the same office.
      It may be subject to transaction fees, in which case these fees are deducted from the sender's account,
      for the benefit of the office.
      It can be canceled by an administrator.
    """
    sender_initials: str = Field(foreign_key="accounts.initials")
    receiver_initials: str = Field(foreign_key="accounts.initials")

    charges: Annotated[Decimal, Field(ge=0)]


class DepositBase(pr.TransactionDB):
    __tablename__ = "deposits"
    """
        A deposit transaction is made for an account domiciled in the office.
        It cannot be subject to fees.
    """
    owner_initials: str = Field(foreign_key="accounts.initials")


class SendingBase(pr.TransactionDB):
    __tablename__ = "sendings"
    """
    A transfer transaction is made by a client of the office and the payment is made elsewhere by an office collaborator.
    The collaborator has an open account.
    In this case, the available funds at the office increase and the collaborator's account is debited.
    This transaction may be subject to transaction fees, in which case these fees are paid by the client for the benefit of the office.
    """

    receiver_initials: str = Field(foreign_key="accounts.initials")

    method: pr.PaymentMethod
    payment_currency: pr.Currency
    charges: Annotated[Decimal, Field(ge=0)]


def get_forex_buying_amount(cls) -> Decimal:

    if cls.tag != "BANKTT" and cls.buying_rate:
        return cls.amount / cls.buying_rate

    if cls.bank_fees and cls.bank_rate:
        return ((cls.amount * cls.bank_rate) + cls.bank_fees) / cls.rate

    return cls.amount


def get_forex_selling_amount(cls) -> Decimal:

    if cls.tag != "BANKTT" and cls.selling_rate:
        return cls.amount / cls.selling_rate

    return cls.amount * (1 + cls.selling_rate / 100)


class ForExBase(pr.TransactionDB):
    """
    Une transaction de change est effectué
    """

    __tablename__ = "forex"
    currency: pr.Currency
    base_currency: pr.Currency
    buying_rate: Annotated[Decimal, Field(ge=0)]
    selling_rate: Annotated[Decimal, Field(ge=0)]
    bank_fees: Annotated[Optional[Decimal], Field(ge=0, nullable=True)]
    bank_rate: Annotated[Optional[Decimal], Field(ge=0, nullable=True)]
    provider_account: str = Field(foreign_key="accounts.initials")
    customer_account: str = Field(foreign_key="accounts.initials")
    tag: str = Field(nullable=True)
    charge_percentage: Annotated[Decimal, Field(ge=0, le=100)]
    is_valid: ClassVar[bool] = hybrid_property(lambda cls: cls.buying_rate > cls.selling_rate)
    buying_amount: ClassVar[Decimal] = hybrid_property(get_forex_buying_amount)
    selling_amount: ClassVar[Decimal] = hybrid_property(get_forex_selling_amount)
    forex_result: ClassVar[Decimal] = hybrid_property(
        lambda cls: cls.selling_amount - cls.buying_amount
    )


class ForExWithPayments(ForExBase):
    payments: List[Payment] = PydanticField(default=[])


class ForEx(ForExBase, table=True):
    def withPayments(self, payments: List[Payment]) -> ForExWithPayments:
        return ForExWithPayments(**self.dict(), payments=payments)


class ExternalBase(pr.TransactionDB):
    __tablename__ = "externals"
    """
       A Transaction is a transaction made to a third party's account for the office.
       It is made physically at the office in cash. This implies a physical movement of the available funds at the office.
    """
    sender_initials: str = Field(foreign_key="accounts.initials")
    charges: Annotated[Decimal, Field(ge=0)]
    customer: Mapping[Any, Mapping | Any] = Field(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )


class ExternalWithPayments(ExternalBase):
    payments: List[Payment] = PydanticField(default=[])


class SendingWithPayments(SendingBase):
    payments: List[Payment] = PydanticField(default=[])


class DepositWithPayments(DepositBase):
    payments: List[Payment] = PydanticField(default=[])


class External(ExternalBase, table=True):

    def withPayments(self, payments: List[Payment]) -> ExternalWithPayments:
        return ExternalWithPayments(**self.dict(), payments=payments)


class Sending(SendingBase, table=True):

    def withPayments(self, payments: List[Payment]) -> SendingWithPayments:
        return SendingWithPayments(**self.dict(), payments=payments)


class Deposit(DepositBase, table=True):

    def withPayments(self, payments: List[Payment]) -> DepositWithPayments:
        return DepositWithPayments(**self.dict(), payments=payments)


class Rate(SQLModel):
    quotient: Decimal
    divider: Decimal


@dataclasses.dataclass
class WalletBalance(SQLModel):
    amount_wc: Decimal  # the current wallet balance if expressed in the wallet currency
    amount_pc: Decimal  # the current wallet balance if expressed in the payment currency


def get_wallet_rate(cls) -> Decimal:
    getcontext().prec = 5
    return Decimal(cls.initial_balance_wc / cls.initial_balance_pc)


def get_buyed_amount(cls) -> Decimal:
    getcontext().prec = 5
    return Decimal(cls.amount / cls.wallet_rate) if cls.is_buying else cls.paid


def get_trading_result(cls) -> Decimal:
    if cls.state == pr.TransactionState.PENDING or cls.trading_type in [
        pr.TradingType.DEPOSIT,
        pr.TradingType.BUY,
    ]:
        return 0

    if cls.trading_type == pr.TradingType.EXCHANGE:
        if cls.wallet_crypto == 0:
            return 0
        exchange_value = cls.amount * (cls.trading_rate / cls.daily_rate)
        worth = cls.amount * (cls.wallet_value / cls.wallet_crypto)
        return exchange_value - worth

    if cls.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
        return cls.trading_amount - cls.trading_cost

    if cls.trading_type == pr.TradingType.SIMPLE_SELL:
        return cls.trading_amount - cls.trading_cost

    selling_value = cls.amount / cls.trading_rate

    if cls.trading_currency != cls.selling_currency:
        selling_value = cls.amount * (cls.trading_rate / cls.daily_rate)

    return selling_value - cls.trading_cost


def get_trading_amount(cls) -> Decimal:

    if cls.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
        return cls.amount * (cls.selling_rate / cls.daily_rate)

    if cls.trading_type == pr.TradingType.BUY or cls.trading_type == pr.TradingType.EXCHANGE:
        return cls.amount * (cls.trading_rate / cls.daily_rate)

    if cls.trading_currency != cls.selling_currency:
        return cls.amount * (cls.trading_rate / cls.daily_rate)

    if cls.trading_type == pr.TradingType.SIMPLE_SELL:
        return cls.amount * (1 + cls.trading_rate / 100)

    return cls.amount / cls.trading_rate


def get_trading_cost(cls) -> Decimal:

    if cls.trading_type == pr.TradingType.BUY:
        # when we are buying, we are buying crypto currency and using wallet trading currency
        # buying cost is the amount of crypto currency in office currency
        # buying cost = trading_rate / daily_rate
        br = cls.trading_rate / cls.daily_rate if cls.daily_rate else 0
        return cls.amount * br

    if cls.trading_type == pr.TradingType.DEPOSIT:
        return cls.amount * (1 + cls.trading_rate / 100)

    if cls.state == pr.TransactionState.PENDING or cls.wallet_trading == 0:
        return 0

    if (
        cls.trading_type == pr.TradingType.EXCHANGE
        or cls.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET
    ):
        # let's image we exchanged 10 000 USDT for 721 500 RMB
        # how much 10 000 USDT are worth in the wallet value ?
        value_rate = cls.wallet_value / cls.wallet_crypto if cls.wallet_crypto > 0 else 0
        return cls.amount * value_rate

    cost_rate = cls.wallet_value / cls.wallet_trading if cls.wallet_trading else 0

    if cls.trading_type == pr.TradingType.SIMPLE_SELL:
        cost_rate = cls.wallet_value / cls.wallet_trading if cls.wallet_trading else 0

    if cls.trading_currency != cls.selling_currency and cls.wallet_crypto > 0:
        cost_rate = cls.wallet_value / cls.wallet_crypto if cls.wallet_crypto else 0

    return cls.amount * cost_rate


def get_trading_crypto(cls) -> Decimal:

    if cls.trading_type == pr.TradingType.SELL and cls.trading_currency == cls.selling_currency:
        # let's image we sold 10 000 RMB
        # how much those 10 000 RMB are worth in wallet currency "USDT"
        # let's image the wallet was valued 100 000 USDT for 721 500 RMB, then the rate is 0.1386
        # so the 10 000 RMB are worth 1386.00 USDT
        if cls.state == pr.TransactionState.PENDING:
            return 0

        wallet_crypto_rate = cls.wallet_crypto / cls.wallet_trading if cls.wallet_trading else 0

        return cls.amount * wallet_crypto_rate

    if cls.trading_type == pr.TradingType.SIMPLE_SELL:
        return 0

    return cls.amount


def get_exchange_amount(cls) -> Decimal:
    if (
        cls.trading_type
        not in [pr.TradingType.EXCHANGE, pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET]
        or not cls.exchange_rate
    ):
        return 0

    if cls.trading_type == pr.TradingType.EXCHANGE_WITH_SIMPLE_WALLET:
        return cls.amount * (cls.exchange_rate / cls.trading_rate) if cls.trading_rate else 0

    return cls.amount * cls.exchange_rate


def get_payments(cls) -> List[Payment]:
    with Session(engine) as db:
        return db.scalars(
            select(Payment)
            .where(Payment.transaction_id == cls.id)
            .order_by(Payment.payment_date.desc())
        ).all()


class WalletTrading(pr.WalletTradingBase, table=True):
    __tablename__ = "wallet_trading"
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )
    created_at: Annotated[datetime, PydanticField(default_factory=datetime.now)]
    created_by: UUID = Field(foreign_key="employees.id")
    reviwed_by: UUID | None = Field(foreign_key="employees.id")

    exchange_currency: pr.Currency = Field(nullable=True)
    selling_currency: str = Field(nullable=True)
    trading_currency: str = Field(nullable=True)

    state: pr.TransactionState

    amount: Decimal = Field(gt=0, nullable=False, max_digits=19, decimal_places=3)

    pendings: Decimal = Field(gt=0, nullable=False, max_digits=19, decimal_places=3)
    wallet_value: Decimal = Field(
        ge=0, nullable=False, max_digits=19, decimal_places=3
    )  # ///< what is the rate value of the wallet
    wallet_crypto: Decimal = Field(
        ge=0, nullable=False, max_digits=19, decimal_places=3
    )  # ///< the current rate of the wallet
    wallet_trading: Decimal = Field(
        ge=0, nullable=False, max_digits=19, decimal_places=3
    )  # ///< how much the wallet is worth in wallet currency

    exchange_walletID: str = Field(foreign_key="wallets.walletID", nullable=True)
    account: str = Field(foreign_key="accounts.initials", nullable=True)
    exchange_rate: Decimal = Field(gt=0, nullable=True, max_digits=11, decimal_places=6)
    selling_rate: Decimal = Field(gt=0, nullable=True, max_digits=11, decimal_places=6)

    notes: List[Mapping[Any, Mapping | Any]] = Field(
        default={}, sa_column=sa.Column(MutableList.as_mutable(pg.JSONB))
    )

    trading_cost: ClassVar[Decimal] = hybrid_property(get_trading_cost)
    trading_amount: ClassVar[Decimal] = hybrid_property(get_trading_amount)
    trading_exchange: ClassVar[Decimal] = hybrid_property(get_exchange_amount)
    trading_crypto: ClassVar[Decimal] = hybrid_property(get_trading_crypto)

    trading_result: ClassVar[Decimal] = hybrid_property(get_trading_result)

    def to_report_item(self) -> dict:

        request_message = next((note for note in self.notes if note["type"] == "SELL"), None)

        return {
            "created_at": self.created_at,
            "amount": str(self.trading_amount),
            "type": str(pr.TransactionType.TRADING.value),
            "converted": str(self.trading_amount * self.daily_rate),
            "code": self.code,
            "state": str(self.state.value),
            "description": request_message["message"] if request_message else "",
            "is_out": self.trading_type == pr.TradingType.SELL,
        }

    payments: ClassVar[List[Payment]] = hybrid_property(get_payments)


TransactionWithDetails = Union[
    Internal, DepositWithPayments, SendingWithPayments, ExternalWithPayments, ForExWithPayments
]
