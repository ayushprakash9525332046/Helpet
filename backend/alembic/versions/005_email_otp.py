"""email_otp_migration

Revision ID: 005_email_otp
Revises: 4ed15d91127d
Create Date: 2026-04-14

Switch OTP from SMS to email:
- users: email NOT NULL, add is_email_verified
- otps: add email column, make phone nullable
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '005_email_otp'
down_revision: Union[str, None] = '4ed15d91127d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users: backfill NULL emails then make NOT NULL ──────────
    op.execute(
        "UPDATE users SET email = CONCAT('unknown_', id::text, '@placeholder.com') WHERE email IS NULL"
    )
    op.alter_column('users', 'email', nullable=False)

    # ── users: add is_email_verified ────────────────────────────
    op.add_column('users', sa.Column('is_email_verified', sa.Boolean(), nullable=False, server_default='false'))

    # ── otps: add email column (indexed) ────────────────────────
    op.add_column('otps', sa.Column('email', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_otps_email'), 'otps', ['email'], unique=False)

    # ── otps: make phone nullable ────────────────────────────────
    op.alter_column('otps', 'phone', nullable=True)


def downgrade() -> None:
    op.alter_column('otps', 'phone', nullable=False)
    op.drop_index(op.f('ix_otps_email'), table_name='otps')
    op.drop_column('otps', 'email')
    op.drop_column('users', 'is_email_verified')
    op.alter_column('users', 'email', nullable=True)
