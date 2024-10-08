"""add tag to forex

Revision ID: 026c99e9d1e2
Revises: 60bb90f25dab
Create Date: 2024-10-03 12:22:02.735735

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = "026c99e9d1e2"
down_revision = "60bb90f25dab"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("forex", sa.Column("tag", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("forex", "tag")
    # ### end Alembic commands ###
