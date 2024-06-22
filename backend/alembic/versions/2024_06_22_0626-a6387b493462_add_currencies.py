"""add currencies

Revision ID: a6387b493462
Revises: 86d4e3ca5281
Create Date: 2024-06-22 06:26:23.502511

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a6387b493462'
down_revision = '86d4e3ca5281'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('offices', sa.Column('currencies', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('offices', 'currencies')
    # ### end Alembic commands ###
