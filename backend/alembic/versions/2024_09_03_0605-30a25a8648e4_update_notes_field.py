"""update notes field

Revision ID: 30a25a8648e4
Revises: d00e5447addf
Create Date: 2024-09-03 06:05:13.843160

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "30a25a8648e4"
down_revision = "d00e5447addf"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "deposits",
        "notes",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.alter_column(
        "externals",
        "notes",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.alter_column(
        "forex",
        "notes",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.alter_column(
        "internals",
        "notes",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )

    op.alter_column(
        "sendings",
        "notes",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###

    op.alter_column(
        "sendings",
        "notes",
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )

    op.alter_column(
        "internals",
        "notes",
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )

    op.alter_column(
        "forex",
        "notes",
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )

    op.alter_column(
        "externals",
        "notes",
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )

    op.alter_column(
        "deposits",
        "notes",
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
    )
    # ### end Alembic commands ###
