"""add wallet worth

Revision ID: 2145ffc5834c
Revises: 5c97826a2fe9
Create Date: 2024-08-07 00:52:30.770412

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = '2145ffc5834c'
down_revision = '5c97826a2fe9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('wallets', sa.Column('value', sa.Numeric(precision=19, scale=4), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('wallets', 'value')
    op.alter_column('wallet_trading', 'exchange_rate',
               existing_type=sa.NUMERIC(precision=11, scale=6),
               nullable=True)
    # ### end Alembic commands ###
