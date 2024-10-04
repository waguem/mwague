"""Transactions models"""

from datetime import datetime
import dataclasses

from decimal import Decimal, getcontext
from typing import Annotated, Mapping, Any, Optional, Union, List, ClassVar
from uuid import UUID, uuid4
from sqlalchemy.ext.mutable import MutableDict, MutableList
from pydantic import Field as PydanticField
from mkdi_shared.schemas import protocol as pr
from sqlmodel import Field, SQLModel
from sqlalchemy.ext.hybrid import hybrid_property
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


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


class Deposit(pr.TransactionDB, table=True):
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


class ForExBase(pr.TransactionDB):
    """
    Une transaction de change est effectué
    """

    __tablename__ = "forex"
    currency: pr.Currency
    base_currency: pr.Currency
    buying_rate: Annotated[Decimal, Field(ge=0)]
    selling_rate: Annotated[Decimal, Field(ge=0)]
    provider_account: str = Field(foreign_key="accounts.initials")
    customer_account: str = Field(foreign_key="accounts.initials")
    tag: str = Field(nullable=True)
    charge_percentage: Annotated[Decimal, Field(ge=0, le=100)]
    is_valid: ClassVar[bool] = hybrid_property(lambda cls: cls.buying_rate > cls.selling_rate)
    buying_amount: ClassVar[Decimal] = hybrid_property(lambda cls: cls.amount / cls.buying_rate)
    selling_amount: ClassVar[Decimal] = hybrid_property(lambda cls: cls.amount / cls.selling_rate)
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


class External(ExternalBase, table=True):

    def withPayments(self, payments: List[Payment]) -> ExternalWithPayments:
        return ExternalWithPayments(**self.dict(), payments=payments)


class Sending(SendingBase, table=True):

    def withPayments(self, payments: List[Payment]) -> SendingWithPayments:
        return SendingWithPayments(**self.dict(), payments=payments)


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
    if cls.state == pr.TransactionState.PENDING or cls.trading_type == pr.TradingType.BUY:
        return 0

    if cls.trading_type == pr.TradingType.EXCHANGE:
        exchange_value = cls.amount * (cls.trading_rate / cls.daily_rate)
        worth = cls.amount * (cls.wallet_value / cls.wallet_crypto)
        return exchange_value - worth

    return (cls.amount / cls.trading_rate) - cls.trading_cost


def get_trading_amount(cls) -> Decimal:

    if cls.trading_type == pr.TradingType.EXCHANGE:
        return cls.amount / cls.exchange_rate

    if cls.trading_type == pr.TradingType.BUY:
        return cls.amount * (cls.trading_rate / cls.daily_rate)

    return cls.amount / cls.trading_rate


def get_trading_cost(cls) -> Decimal:
    if cls.state == pr.TransactionState.PENDING or cls.wallet_trading == 0:
        return 0

    if cls.trading_type == pr.TradingType.BUY:
        # when we are buying, we are buying crypto currency and using wallet trading currency
        # buying cost is the amount of crypto currency in office currency
        # buying cost = trading_rate / daily_rate
        br = cls.trading_rate / cls.daily_rate
        return cls.amount * br

    if cls.trading_type == pr.TradingType.EXCHANGE:
        # let's image we exchanged 10 000 USDT for 721 500 RMB
        # how much 10 000 USDT are worth in the wallet value ?
        value_rate = cls.wallet_value / cls.wallet_crypto
        return cls.amount * value_rate

    cost_rate = cls.wallet_value / cls.wallet_trading

    return cls.amount * cost_rate


def get_trading_crypto(cls) -> Decimal:

    if cls.trading_type == pr.TradingType.SELL:
        # let's image we sold 10 000 RMB
        # how much those 10 000 RMB are worth in wallet currency "USDT"
        # let's image the wallet was valued 100 000 USDT for 721 500 RMB, then the rate is 0.1386
        # so the 10 000 RMB are worth 1386.00 USDT
        if cls.state == pr.TransactionState.PENDING:
            return 0
        wallet_crypto_rate = cls.wallet_crypto / cls.wallet_trading

        return cls.amount * wallet_crypto_rate

    return cls.amount


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

    currency: str

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

    notes: List[Mapping[Any, Mapping | Any]] = Field(
        default={}, sa_column=sa.Column(MutableList.as_mutable(pg.JSONB))
    )

    trading_cost: ClassVar[Decimal] = hybrid_property(get_trading_cost)
    trading_result: ClassVar[Decimal] = hybrid_property(get_trading_result)
    trading_amount: ClassVar[Decimal] = hybrid_property(get_trading_amount)
    trading_crypto: ClassVar[Decimal] = hybrid_property(get_trading_crypto)

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


TransactionWithDetails = Union[
    Internal, Deposit, SendingWithPayments, ExternalWithPayments, ForExWithPayments
]
