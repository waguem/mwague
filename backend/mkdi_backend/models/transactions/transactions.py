from decimal import Decimal, getcontext
from typing import Annotated, Mapping, Any, Optional, Union, List, ClassVar
from uuid import UUID, uuid4
from sqlalchemy.ext.mutable import MutableDict
from pydantic import Field as PydanticField, BaseModel
from mkdi_shared.schemas import protocol as pr
from sqlmodel import Field, SQLModel, func
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import composite, Mapped, mapped_column
from datetime import datetime
import dataclasses


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

    bid_rate: Decimal
    offer_rate: Decimal
    method: pr.PaymentMethod
    payment_currency: pr.Currency
    charges: Annotated[Decimal, Field(ge=0)]

    customer_sender: Mapping[Any, Mapping | Any] = Field(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )

    customer_receiver: Mapping[Any, Mapping | Any] = Field(
        default={}, sa_column=sa.Column(MutableDict.as_mutable(pg.JSONB))
    )


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


class TransactionItem(BaseModel):
    item: Union[Internal, Deposit, Sending, ForEx, External]


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


class ForeignExBase(pr.TransactionDB):
    __tablename__ = "foreign_exchanges"
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    """
    this account reference either the provider account or the customer depending on whether the transaction is a purchase or a sale
    """
    account: str = Field(foreign_key="accounts.initials")
    # this rate can be either a buying rate or a selling rate
    rate: Decimal = Field(gt=0, default=1, nullable=False, max_digits=10, decimal_places=6)
    # the amount is always is expressed in the wallet currency
    amount: Decimal = Field(gt=0, nullable=False, max_digits=19, decimal_places=3)
    # the paid amount is always expressed in the transaction currency (or payment currency)
    paid: Decimal = Field(gt=0, nullable=False, max_digits=19, decimal_places=3)
    # whether the transaction is a purchase or a sale this should never be updated manually in any scenario
    is_buying: bool = Field(nullable=False)
    #
    wallet_id: str = Field(foreign_key="wallets.walletID")

    initial_balance_pc: Decimal = Field(ge=0, nullable=False, max_digits=19, decimal_places=3)
    initial_balance_wc: Decimal = Field(ge=0, nullable=False, max_digits=19, decimal_places=3)

    wallet_rate: ClassVar[Decimal] = hybrid_property(get_wallet_rate)
    # thiis amount expres the amount in payment currency at buying time
    # in other words how much the same amount was worth in the payment currency at the time of the transaction
    # this is use only when the transaction is a sale
    buyed: ClassVar[Decimal] = hybrid_property(get_buyed_amount)


class ForeignExWithPayments(ForeignExBase, table=False):
    payments: List[Payment] = PydanticField(default=[])


class ForeignEx(ForeignExBase, table=True):
    def withPayments(self, payments: List[Payment]) -> ForeignExWithPayments:
        return ForeignExWithPayments(**self.dict(), payments=payments)


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
    state: pr.TransactionState

    amount: Decimal = Field(gt=0, nullable=False, max_digits=19, decimal_places=3)
    initial_balance: Decimal = Field(ge=0, nullable=False, max_digits=19, decimal_places=3)


TransactionWithDetails = Union[
    Internal, Deposit, SendingWithPayments, ForeignExWithPayments, ExternalWithPayments
]
