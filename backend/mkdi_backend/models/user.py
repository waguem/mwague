from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from mkdi_shared.schemas import protocol
from sqlmodel import AutoString, Field, Index, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "user"
    __table_args__ = (
        Index("ix_user_username", "api_client_id", "username", "auth_method", unique=True),
        Index("ix_user_display_name_id", "display_name", "id", unique=True),
    )

    id: Optional[UUID] = Field(
        sa_column=sa.Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    # the username of the user
    email: str = Field(nullable=False, max_length=128, unique=True)
    #
    username: str = Field(nullable=False, max_length=128, unique=True)
    # the authentication method used by the user
    # if local then the a password must be provided
    auth_method: str = Field(nullable=False, max_length=128, default="local")
    # in case of local authentication method the user will provide
    # a password, which will be used to generate a hash
    hashed_password: str = Field(nullable=False, max_length=512, default="")
    display_name: str = Field(nullable=False, max_length=256)
    created_date: Optional[datetime] = Field(
        sa_column=sa.Column(
            sa.DateTime(timezone=True), nullable=False, server_default=sa.func.current_timestamp()
        )
    )
    # the api client that created the user will be assigned to the user
    api_client_id: UUID = Field(foreign_key="api_client.id")
    # the user can be enabled or disabled
    enabled: bool = Field(sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.true()))
    notes: str = Field(
        sa_column=sa.Column(AutoString(length=1024), nullable=False, server_default="")
    )
    # the user can be deleted or not
    deleted: bool = Field(
        sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )

    # only used for time span "total"
    last_activity_date: Optional[datetime] = Field(
        sa_column=sa.Column(
            sa.DateTime(timezone=True), nullable=True, server_default=sa.func.current_timestamp()
        )
    )

    def to_protocol_frontend_user(self):
        return protocol.FrontEndUser(
            user_id=self.id,
            username=self.username,
            id=self.username,
            display_name=self.display_name,
            notes=self.notes,
            auth_method=self.auth_method,
            email=self.email,
            enabled=self.enabled,
            deleted=self.deleted,
            created_date=self.created_date,
        )
