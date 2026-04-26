"""add discount_percentage and platform_fee_percentage to services

Revision ID: 007_service_pricing_fields
Revises: 006_service_order
Create Date: 2026-04-26
"""

from alembic import op
import sqlalchemy as sa

revision = "007_service_pricing_fields"
down_revision = "006_service_order"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "services",
        sa.Column("discount_percentage", sa.Numeric(5, 2), nullable=False, server_default="15"),
    )
    op.add_column(
        "services",
        sa.Column("platform_fee_percentage", sa.Numeric(5, 2), nullable=False, server_default="10"),
    )


def downgrade():
    op.drop_column("services", "platform_fee_percentage")
    op.drop_column("services", "discount_percentage")
