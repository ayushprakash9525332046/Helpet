"""Add order column to services

Revision ID: 006_service_order
Revises: 005_email_otp
Create Date: 2026-04-14
"""
from alembic import op
import sqlalchemy as sa

revision = "006_service_order"
down_revision = "005_email_otp"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "services",
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("services", "order")
