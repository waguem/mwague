from decimal import Decimal
from typing import Annotated, Mapping, Any, Optional, Union, List, ClassVar
from uuid import UUID, uuid4
from sqlalchemy.ext.mutable import MutableDict
from pydantic import Field as PydanticField, BaseModel
from mkdi_shared.schemas import protocol as pr
from sqlmodel import Field
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.ext.hybrid import hybrid_property


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

    def withPayments(self, payments: List[Payment]) -> ExternalWithPayments:
        return SendingWithPayments(**self.dict(), payments=payments)


class TransactionItem(BaseModel):
    item: Union[Internal, Deposit, Sending, ForEx, External]


TransactionWithDetails = Union[
    Internal, Deposit, SendingWithPayments, ForExWithPayments, ExternalWithPayments
]
