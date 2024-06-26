"""Add Account table

Revision ID: 79f9717d9f53
Revises: ae060c7df601
Create Date: 2024-06-17 04:51:22.953787

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "79f9717d9f53"
down_revision = "ae060c7df601"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "agents", sa.Column("country", sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False)
    )
    op.add_column(
        "agents", sa.Column("phone", sqlmodel.sql.sqltypes.AutoString(length=16), nullable=False)
    )
    op.add_column(
        "agents", sa.Column("email", sqlmodel.sql.sqltypes.AutoString(length=128), nullable=False)
    )
    op.drop_constraint("agents_initials_key", "agents", type_="unique")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint("agents_initials_key", "agents", ["initials"])
    op.drop_column("agents", "email")
    op.drop_column("agents", "phone")
    op.drop_column("agents", "country")
    # ### end Alembic commands ###
