import sqlalchemy as sa
from typing import Optional
from uuid import UUID,uuid4
from sqlmodel import Field, SQLModel
import sqlalchemy.dialects.postgresql as pg

class Organization(SQLModel,table=True):
    __tablename__ = "organizations"

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    # this is the initials of the organization
    initials : str = Field(nullable=False,max_length=8,unique=True)
    org_name : str = Field(nullable=False,max_length=64)