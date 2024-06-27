from datetime import date
from decimal import Decimal
from typing import Annotated, Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import PaymentMethod, TransactionDB, TransactionResponse
from sqlmodel import JSON, Field, Index


class Internal(TransactionDB,table=True):
    __tablename__ = "internals"

    """
      An internal transaction is made between two accounts domiciled in the same office.
      It may be subject to transaction fees, in which case these fees are deducted from the sender's account,
      for the benefit of the office.
      It can be canceled by an administrator.
    """

    sender_account_id: UUID = Field(foreign_key="accounts.id")
    receiver_account_id: UUID = Field(foreign_key="accounts.id")

    charges:Annotated[Decimal,Field(ge=0)]

    def to_response(self)->TransactionResponse:
        return TransactionResponse(
            **self.dict()
        )



class Deposit(TransactionDB,table=True):
    __tablename__ = "deposits"
    """
        A deposit transaction is made for an account domiciled in the office.
        It cannot be subject to fees.
    """
    account_id: UUID = Field(foreign_key="accounts.id")

    def to_response(self)->TransactionResponse:
        return TransactionResponse(
            **self.dict()
        )
class Sending(TransactionDB,table=True):
    __tablename__ = "sendings"
    """
    A transfer transaction is made by a client of the office and the payment is made elsewhere by an office collaborator.
    The collaborator has an open account.
    In this case, the available funds at the office increase and the collaborator's account is debited.
    This transaction may be subject to transaction fees, in which case these fees are paid by the client for the benefit of the office.
    """

    receiver_account_id: UUID = Field(foreign_key="accounts.id")

    bid_rate: Decimal
    offer_rate: Decimal
    method: PaymentMethod

class ForEx(TransactionDB,table=True):
    """
    Une transaction de change est effectué
    """
    __tablename__ = "forex"
    bid_rate: Decimal
    offer_rate: Decimal
    method: PaymentMethod

class External(TransactionDB,table=True):
    __tablename__ = "externals"
    """
       A Transaction is a transaction made to a third party's account for the office.
       It is made physically at the office in cash. This implies a physical movement of the available funds at the office.
    """
    sender_account_id: UUID = Field(foreign_key="accounts.id")
