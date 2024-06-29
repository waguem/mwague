from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import ActivityBase
from pydantic import Field as PydanticField
from sqlmodel import JSON, Field, Relationship, SQLModel


class FundCommit(SQLModel, table=True):
    __tablename__ = "fundcommits"
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    v_from: Decimal
    variation: Decimal
    date: date
    description: str = Field(max_length=128, nullable=True)
    activity_id: UUID = Field(foreign_key="activities.id")
    activity: "Activity" = Relationship(back_populates="fundcommits")  # type: ignore


class Activity(ActivityBase, table=True):
    __tablename__ = "activities"
    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    closed_at: Optional[date] = Field(nullable=True)

    started_by: UUID = Field(foreign_key="employees.id", nullable=True)
    closed_by: UUID = Field(foreign_key="employees.id", nullable=True)
    office_id: UUID = Field(foreign_key="offices.id")
    openning_rate: dict | list[dict] = Field(default={}, sa_column=sa.Column(pg.JSONB))
    closing_rate: dict | list[dict] = Field(default={}, sa_column=sa.Column(pg.JSONB))

    openning_fund: Decimal
    closing_fund: Decimal
    # an activity is linked to a FUND account type
    account_id: UUID = Field(foreign_key="accounts.id")

    fundcommits: list["FundCommit"] = Relationship(back_populates="activity")  # type: ignore
