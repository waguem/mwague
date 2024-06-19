"""Add agent table

Revision ID: 9f10079f463c
Revises: a1e9e86e464f
Create Date: 2024-06-14 15:26:01.274372

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "9f10079f463c"
down_revision = "a1e9e86e464f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "agents",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("initials", sqlmodel.sql.sqltypes.AutoString(length=4), nullable=False),
        sa.Column("org_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("office_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("type", sa.Enum("AGENT", "SUPPLIER", name="agenttype"), nullable=False),
        sa.ForeignKeyConstraint(
            ["office_id"],
            ["offices.id"],
        ),
        sa.ForeignKeyConstraint(
            ["org_id"],
            ["organizations.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("initials"),
    )
    op.create_index("ix_agent_initials", "agents", ["initials", "org_id", "office_id"], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index("ix_agent_initials", table_name="agents")
    op.drop_table("agents")
    # ### end Alembic commands ###
