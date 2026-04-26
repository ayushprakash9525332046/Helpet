"""backfill discount_percentage = 15 for services where it is 0

Revision ID: 008_backfill_discount_percentage
Revises: 007_service_pricing_fields
Create Date: 2026-04-26
"""

from alembic import op

revision = "008_backfill_discount_percentage"
down_revision = "007_service_pricing_fields"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE services SET discount_percentage = 15 WHERE discount_percentage = 0 OR discount_percentage IS NULL"
    )


def downgrade():
    pass
