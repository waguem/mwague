from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import OfficeBase
from sqlmodel import Field, Relationship


class Office(OfficeBase, table=True):
    __tablename__ = "offices"

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    # an office is part of an organization
    organization_id: UUID = Field(foreign_key="organizations.id")
    organization: "Organization" = Relationship(back_populates="offices")  # type: ignore

    employees: list["Employee"] = Relationship(back_populates="office")  # type: ignore
