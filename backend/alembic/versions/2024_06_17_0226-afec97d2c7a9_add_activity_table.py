"""Add activity table

Revision ID: afec97d2c7a9
Revises: db06ecdece03
Create Date: 2024-06-17 02:26:36.505753

"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision = "afec97d2c7a9"
down_revision = "db06ecdece03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("accounts", sa.Column("office_id", sqlmodel.sql.sqltypes.GUID(), nullable=False))
    op.create_foreign_key(None, "accounts", "offices", ["office_id"], ["id"])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "accounts", type_="foreignkey")
    op.drop_column("accounts", "office_id")
    # ### end Alembic commands ###
