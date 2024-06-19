from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import AgentBase, AgentType
from sqlmodel import Field


class Agent(AgentBase, table=True):
    __tablename__ = "agents"
    # create an index on initails org_id and office_id
    __table_args__ = (
        sa.Index("ix_agent_initials", "initials", "org_id", "office_id", unique=True),
    )

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    org_id: UUID = Field(foreign_key="organizations.id")
    office_id: UUID = Field(foreign_key="offices.id")
