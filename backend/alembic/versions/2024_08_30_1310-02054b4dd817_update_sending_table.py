"""update sending table

Revision ID: 02054b4dd817
Revises: a673d2b1ce98
Create Date: 2024-08-30 13:10:16.398838

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "02054b4dd817"
down_revision = "a673d2b1ce98"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("sendings", "customer_receiver")
    op.drop_column("sendings", "customer_sender")
    op.drop_column("sendings", "bid_rate")
    op.drop_column("sendings", "offer_rate")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "sendings", sa.Column("offer_rate", sa.NUMERIC(), autoincrement=False, nullable=False)
    )
    op.add_column(
        "sendings", sa.Column("bid_rate", sa.NUMERIC(), autoincrement=False, nullable=False)
    )
    op.add_column(
        "sendings",
        sa.Column(
            "customer_sender",
            postgresql.JSONB(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "sendings",
        sa.Column(
            "customer_receiver",
            postgresql.JSONB(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
    )
    # ### end Alembic commands ###
