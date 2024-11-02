from typing import Optional, ClassVar
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import AccountBase, AccountMonthlyReportBase
from sqlmodel import Field
from datetime import datetime
from decimal import Decimal
from mkdi_backend.models.get_account_pendings import (
    get_account_pendings,
    get_account_pendings_in,
    get_accounts_pendings_out,
)
from sqlalchemy.ext.hybrid import hybrid_property
from pydantic import root_validator


class Account(AccountBase, table=True):
    __tablename__ = "accounts"
    # create an constraint that and office should have only one account of type FUND
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    owner_id: UUID
    is_open: bool = Field(default=True)
    version: int = Field(default=1)

    counter: int = Field(default=0, nullable=True)

    created_by: UUID = Field(foreign_key="employees.id")

    office_id: UUID = Field(foreign_key="offices.id")
    pendings_in: ClassVar[Decimal] = hybrid_property(get_account_pendings_in)
    pendings_out: ClassVar[Decimal] = hybrid_property(get_accounts_pendings_out)
    effective_balance: ClassVar[Decimal] = hybrid_property(
        lambda cls: cls.balance + cls.pendings_in - cls.pendings_out
    )


class AccountMonthlyReport(AccountMonthlyReportBase, table=True):
    __tablename__ = "account_reports"
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    account_id: UUID = Field(foreign_key="accounts.id")
    # last updated at
    updated_at: datetime = Field(default=datetime.now())

    pendings: ClassVar[Decimal] = hybrid_property(get_account_pendings)

    @root_validator
    def start_balance(cls, values):
        if "is_open" in values and values["is_open"]:
            pendings = get_account_pendings(values["account"])
            values["end_balance"] = values["end_balance"] - pendings

        return values
