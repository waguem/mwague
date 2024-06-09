"""Init

Revision ID: a1e9e86e464f
Revises:
Create Date: 2024-06-09 12:13:12.523690

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "a1e9e86e464f"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "organizations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("initials", sqlmodel.sql.sqltypes.AutoString(length=8), nullable=False),
        sa.Column("org_name", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "offices",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("country", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("initials", sqlmodel.sql.sqltypes.AutoString(length=8), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
        sa.Column("organization_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "employees",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("email", sqlmodel.sql.sqltypes.AutoString(length=128), nullable=False),
        sa.Column("username", sqlmodel.sql.sqltypes.AutoString(length=128), nullable=False),
        sa.Column("roles", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("office_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("organization_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("provider_account_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(
            ["office_id"],
            ["offices.id"],
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_employee_username",
        "employees",
        ["office_id", "username", "organization_id"],
        unique=True,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index("ix_employee_username", table_name="employees")
    op.drop_table("employees")
    op.drop_table("offices")
    op.drop_table("organizations")
    # ### end Alembic commands ###
