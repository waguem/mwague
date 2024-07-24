"""add avatar field

Revision ID: f312d178f9b9
Revises: 6d6d78ccc99b
Create Date: 2024-07-21 06:47:54.484199

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "f312d178f9b9"
down_revision = "6d6d78ccc99b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "employees", sa.Column("avatar_url", sqlmodel.sql.sqltypes.AutoString(), nullable=True)
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("employees", "avatar_url")
    # ### end Alembic commands ###
