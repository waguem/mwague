from typing import List, Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Field, SQLModel


class Office(SQLModel, table=True):
    __tablename__ = "offices"

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    country: str = Field(nullable=False, max_length=64)
    initials: str = Field(nullable=False, max_length=8, unique=True)
    name: str = Field(nullable=False, max_length=64)

    # an office is part of an organization
    # organization_id: UUID = Field(foreign_key="organizations.id")

    class Config:
        arbitrary_types_allowed = True
