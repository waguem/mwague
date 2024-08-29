"""remove foreign ex table

Revision ID: a673d2b1ce98
Revises: 012b48885d38
Create Date: 2024-08-20 07:46:34.468399

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "a673d2b1ce98"
down_revision = "012b48885d38"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("foreign_exchanges")
    op.add_column("forex", sa.Column("charge_percentage", sa.Numeric(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("forex", "charge_percentage")
    op.create_table(
        "foreign_exchanges",
        sa.Column("amount", sa.NUMERIC(precision=19, scale=3), autoincrement=False, nullable=False),
        sa.Column("rate", sa.NUMERIC(precision=10, scale=6), autoincrement=False, nullable=False),
        sa.Column("code", sa.VARCHAR(length=64), autoincrement=False, nullable=False),
        sa.Column(
            "state",
            postgresql.ENUM(
                "REVIEW", "PENDING", "PAID", "CANCELLED", "REJECTED", name="transactionstate"
            ),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "type",
            postgresql.ENUM(
                "DEPOSIT", "INTERNAL", "EXTERNAL", "SENDING", "FOREX", name="transactiontype"
            ),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("created_at", postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
        sa.Column(
            "id",
            sa.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("office_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("org_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("created_by", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("reviwed_by", sa.UUID(), autoincrement=False, nullable=True),
        sa.Column(
            "history", postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True
        ),
        sa.Column(
            "notes", postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True
        ),
        sa.Column("account", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("paid", sa.NUMERIC(precision=19, scale=3), autoincrement=False, nullable=False),
        sa.Column("is_buying", sa.BOOLEAN(), autoincrement=False, nullable=False),
        sa.Column("wallet_id", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column(
            "initial_balance_pc",
            sa.NUMERIC(precision=19, scale=3),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "initial_balance_wc",
            sa.NUMERIC(precision=19, scale=3),
            autoincrement=False,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["account"], ["accounts.initials"], name="foreign_exchanges_account_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["created_by"], ["employees.id"], name="foreign_exchanges_created_by_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["office_id"], ["offices.id"], name="foreign_exchanges_office_id_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["org_id"], ["organizations.id"], name="foreign_exchanges_org_id_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["reviwed_by"], ["employees.id"], name="foreign_exchanges_reviwed_by_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["wallet_id"], ["wallets.walletID"], name="foreign_exchanges_wallet_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id", name="foreign_exchanges_pkey"),
        sa.UniqueConstraint("code", name="foreign_exchanges_code_key"),
    )
    # ### end Alembic commands ###