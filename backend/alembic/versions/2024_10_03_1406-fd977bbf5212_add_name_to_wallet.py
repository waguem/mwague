"""add name to wallet

Revision ID: fd977bbf5212
Revises: 026c99e9d1e2
Create Date: 2024-10-03 14:06:36.514145

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "fd977bbf5212"
down_revision = "026c99e9d1e2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "wallets", sa.Column("wallet_name", sqlmodel.sql.sqltypes.AutoString(), nullable=True)
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("wallets", "wallet_name")
    # ### end Alembic commands ###