from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import AccountBase, AccountType
from sqlmodel import Field, Index


class Account(AccountBase, table=True):
    __tablename__ = "accounts"

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    owner_id: UUID
    created_by: UUID = Field(foreign_key="employees.id")

    office_id: UUID = Field(foreign_key="offices.id")
