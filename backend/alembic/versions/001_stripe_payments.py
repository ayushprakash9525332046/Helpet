"""Add transaction_id field to payments

Revision ID: 001_transaction_id
Revises:
Create Date: 2026-04-04
"""
from alembic import op
import sqlalchemy as sa

revision = "001_transaction_id"
down_revision = "9eebb858ac86"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "payments",
        sa.Column("transaction_id", sa.String(255), nullable=True, unique=True),
    )
    # Drop legacy payment fields
    try:
        op.drop_constraint("payments_razorpay_order_id_key", "payments", type_="unique")
    except Exception:
        pass
    op.drop_column("payments", "razorpay_order_id")
    op.drop_column("payments", "razorpay_payment_id")
    op.drop_column("payments", "razorpay_signature")


def downgrade() -> None:
    op.add_column("payments", sa.Column("razorpay_order_id", sa.String(100), nullable=True))
    op.add_column("payments", sa.Column("razorpay_payment_id", sa.String(100), nullable=True))
    op.add_column("payments", sa.Column("razorpay_signature", sa.String(255), nullable=True))
    op.drop_column("payments", "transaction_id")
