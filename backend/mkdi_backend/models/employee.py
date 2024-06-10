from typing import List, Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas.protocol import EmployeeBase
from sqlmodel import Field, Index, Relationship


class Employee(EmployeeBase, table=True):
    __tablename__ = "employees"
    __table_args__ = (
        Index("ix_employee_username", "office_id", "username", "organization_id", unique=True),
    )

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        )
    )

    roles: Optional[str] = Field(default="", nullable=True)
    office_id: UUID = Field(foreign_key="offices.id")
    organization_id: UUID = Field(foreign_key="organizations.id")
    provider_account_id: Optional[str]

    office: "Office" = Relationship(back_populates="employees")  # type: ignore
