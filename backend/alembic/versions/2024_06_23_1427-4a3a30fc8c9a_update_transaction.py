"""update transaction

Revision ID: 4a3a30fc8c9a
Revises: 9266c93efaf0
Create Date: 2024-06-23 14:27:06.772745

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "4a3a30fc8c9a"
down_revision = "9266c93efaf0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "deposits",
        "created_at",
        existing_type=sa.DATE(),
        type_=sa.DateTime(),
        existing_nullable=False,
    )
    op.create_unique_constraint(None, "deposits", ["code"])
    op.drop_column("deposits", "date")
    op.alter_column(
        "externals",
        "created_at",
        existing_type=sa.DATE(),
        type_=sa.DateTime(),
        existing_nullable=False,
    )
    op.create_unique_constraint(None, "externals", ["code"])
    op.drop_column("externals", "date")
    op.alter_column(
        "forex", "created_at", existing_type=sa.DATE(), type_=sa.DateTime(), existing_nullable=False
    )
    op.create_unique_constraint(None, "forex", ["code"])
    op.drop_column("forex", "date")
    op.alter_column(
        "internals",
        "created_at",
        existing_type=sa.DATE(),
        type_=sa.DateTime(),
        existing_nullable=False,
    )
    op.create_unique_constraint(None, "internals", ["code"])
    op.drop_column("internals", "date")
    op.alter_column(
        "sendings",
        "created_at",
        existing_type=sa.DATE(),
        type_=sa.DateTime(),
        existing_nullable=False,
    )
    op.create_unique_constraint(None, "sendings", ["code"])
    op.drop_column("sendings", "date")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "sendings", sa.Column("date", postgresql.TIMESTAMP(), autoincrement=False, nullable=False)
    )
    op.drop_constraint(None, "sendings", type_="unique")
    op.alter_column(
        "sendings",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DATE(),
        existing_nullable=False,
    )
    op.add_column(
        "internals", sa.Column("date", postgresql.TIMESTAMP(), autoincrement=False, nullable=False)
    )
    op.drop_constraint(None, "internals", type_="unique")
    op.alter_column(
        "internals",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DATE(),
        existing_nullable=False,
    )
    op.add_column(
        "forex", sa.Column("date", postgresql.TIMESTAMP(), autoincrement=False, nullable=False)
    )
    op.drop_constraint(None, "forex", type_="unique")
    op.alter_column(
        "forex", "created_at", existing_type=sa.DateTime(), type_=sa.DATE(), existing_nullable=False
    )
    op.add_column(
        "externals", sa.Column("date", postgresql.TIMESTAMP(), autoincrement=False, nullable=False)
    )
    op.drop_constraint(None, "externals", type_="unique")
    op.alter_column(
        "externals",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DATE(),
        existing_nullable=False,
    )
    op.add_column(
        "deposits", sa.Column("date", postgresql.TIMESTAMP(), autoincrement=False, nullable=False)
    )
    op.drop_constraint(None, "deposits", type_="unique")
    op.alter_column(
        "deposits",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DATE(),
        existing_nullable=False,
    )
    # ### end Alembic commands ###