from datetime import date
from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import ActivityBase
from sqlmodel import Date, Field


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
