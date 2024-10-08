"""add wallet type

Revision ID: 0363980542c3
Revises: 460efb4768d8
Create Date: 2024-10-04 09:05:35.100146

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0363980542c3"
down_revision = "460efb4768d8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "wallets",
        sa.Column(
            "wallet_type",
            postgresql.ENUM("CRYPTO", "SIMPLE", name="wallettype", create_type=True),
            nullable=False,
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("wallets", "wallet_type")
    # ### end Alembic commands ###
