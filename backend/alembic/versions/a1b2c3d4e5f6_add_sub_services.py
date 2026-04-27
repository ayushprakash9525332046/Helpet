"""add sub_services table and booking sub_service columns

Revision ID: a1b2c3d4e5f6
Revises: 9eebb858ac86
Create Date: 2026-04-27 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '008_backfill_discount_percentage'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'sub_services',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('service_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['service_id'], ['services.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_sub_services_service_id', 'sub_services', ['service_id'])

    op.add_column('bookings', sa.Column('sub_service_id', sa.UUID(), nullable=True))
    op.add_column('bookings', sa.Column('sub_service_name', sa.String(length=200), nullable=True))
    op.create_foreign_key(
        'fk_bookings_sub_service_id',
        'bookings', 'sub_services',
        ['sub_service_id'], ['id'],
    )


def downgrade() -> None:
    op.drop_constraint('fk_bookings_sub_service_id', 'bookings', type_='foreignkey')
    op.drop_column('bookings', 'sub_service_name')
    op.drop_column('bookings', 'sub_service_id')
    op.drop_index('ix_sub_services_service_id', table_name='sub_services')
    op.drop_table('sub_services')
