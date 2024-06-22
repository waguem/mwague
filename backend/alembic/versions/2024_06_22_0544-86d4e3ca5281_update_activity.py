"""update_activity

Revision ID: 86d4e3ca5281
Revises: 880ccd702d76
Create Date: 2024-06-22 05:44:34.182231

"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '86d4e3ca5281'
down_revision = '880ccd702d76'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('fundcommits',
    sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('v_from', sa.Numeric(), nullable=False),
    sa.Column('variation', sa.Numeric(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=128), nullable=True),
    sa.Column('activity_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['activity_id'], ['activities.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('activities', sa.Column('openning_rate', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('activities', sa.Column('closing_rate', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('activities', sa.Column('openning_fund', sa.Numeric(), nullable=False))
    op.add_column('activities', sa.Column('closing_fund', sa.Numeric(), nullable=False))
    op.add_column('activities', sa.Column('account_id', sqlmodel.sql.sqltypes.GUID(), nullable=False))
    op.alter_column('activities', 'office_id',
               existing_type=sa.NUMERIC(),
               type_=sqlmodel.sql.sqltypes.GUID(),
               existing_nullable=False)
    op.create_foreign_key(None, 'activities', 'offices', ['office_id'], ['id'])
    op.create_foreign_key(None, 'activities', 'accounts', ['account_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'activities', type_='foreignkey')
    op.drop_constraint(None, 'activities', type_='foreignkey')
    op.alter_column('activities', 'office_id',
               existing_type=sqlmodel.sql.sqltypes.GUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
    op.drop_column('activities', 'account_id')
    op.drop_column('activities', 'closing_fund')
    op.drop_column('activities', 'openning_fund')
    op.drop_column('activities', 'closing_rate')
    op.drop_column('activities', 'openning_rate')
    op.drop_table('fundcommits')
    # ### end Alembic commands ###
