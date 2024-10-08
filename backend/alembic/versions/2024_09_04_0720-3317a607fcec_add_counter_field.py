"""add counter field

Revision ID: 3317a607fcec
Revises: 30a25a8648e4
Create Date: 2024-09-04 07:20:58.517227

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "3317a607fcec"
down_revision = "30a25a8648e4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("accounts", sa.Column("counter", sa.Integer(), nullable=True))


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("accounts", "counter")
    # ### end Alembic commands ###
