"""Add order column to service_categories

Revision ID: 002_category_order
Revises: 001_transaction_id
Create Date: 2026-04-08
"""
from alembic import op
import sqlalchemy as sa

revision = "002_category_order"
down_revision = "001_transaction_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "service_categories",
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("service_categories", "order")
