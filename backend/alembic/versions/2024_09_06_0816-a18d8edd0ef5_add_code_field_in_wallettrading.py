"""add code field in wallettrading

Revision ID: a18d8edd0ef5
Revises: 3317a607fcec
Create Date: 2024-09-06 08:16:48.083988

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "a18d8edd0ef5"
down_revision = "3317a607fcec"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "wallet_trading",
        sa.Column("code", sqlmodel.sql.sqltypes.AutoString(length=16), nullable=False),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("wallet_trading", "code")
    # ### end Alembic commands ###
