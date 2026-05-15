"""add performance indexes

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-15 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index('ix_services_is_active',       'services',           ['is_active'])
    op.create_index('ix_services_order',            'services',           ['order'])
    op.create_index('ix_service_categories_active', 'service_categories', ['is_active'])
    op.create_index('ix_service_categories_order',  'service_categories', ['order'])
    op.create_index('ix_bookings_customer_id',      'bookings',           ['customer_id'])
    op.create_index('ix_bookings_status',           'bookings',           ['status'])
    op.create_index('ix_bookings_created_at',       'bookings',           ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_bookings_created_at',       table_name='bookings')
    op.drop_index('ix_bookings_status',           table_name='bookings')
    op.drop_index('ix_bookings_customer_id',      table_name='bookings')
    op.drop_index('ix_service_categories_order',  table_name='service_categories')
    op.drop_index('ix_service_categories_active', table_name='service_categories')
    op.drop_index('ix_services_order',            table_name='services')
    op.drop_index('ix_services_is_active',        table_name='services')
