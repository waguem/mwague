"""Organization model."""

from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import OrganizationBase
from sqlmodel import Field, Relationship


class Organization(OrganizationBase, table=True):
    """Organization class."""

    __tablename__ = "organizations"

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    offices: list["Office"] = Relationship(back_populates="organization")  # type: ignore
