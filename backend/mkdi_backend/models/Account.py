from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import AccountBase, AccountMonthlyReportBase, AccountType
from sqlmodel import Field


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
