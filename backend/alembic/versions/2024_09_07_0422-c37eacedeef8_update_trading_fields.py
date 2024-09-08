"""update trading fields

Revision ID: c37eacedeef8
Revises: a18d8edd0ef5
Create Date: 2024-09-07 04:22:18.340185

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "c37eacedeef8"
down_revision = "a18d8edd0ef5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "wallet_trading", sa.Column("value_rate", sa.Numeric(precision=19, scale=3), nullable=False)
    )
    op.add_column(
        "wallet_trading",
        sa.Column("wallet_rate", sa.Numeric(precision=19, scale=3), nullable=False),
    )
    op.alter_column("wallet_trading", "code", existing_type=sa.VARCHAR(length=16), nullable=True)
    try:
        op.drop_column("externals", "created_at")
        op.add_column("externals", sa.Column("created_at", postgresql.TIMESTAMP(timezone=True)))
    except Exception as e:
        print(e)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("wallet_trading", "code", existing_type=sa.VARCHAR(length=16), nullable=False)
    op.drop_column("wallet_trading", "wallet_rate")
    op.drop_column("wallet_trading", "value_rate")
    # ### end Alembic commands ###