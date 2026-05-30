"""enable row level security on all public tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-05-31

Fixes Supabase advisor "rls_disabled_in_public".

Supabase auto-exposes a public REST API (PostgREST) over the `public` schema
using the anon API key. With RLS disabled, anyone with the project URL + anon
key can read/edit/delete every row, bypassing the FastAPI backend.

This app talks to Postgres directly via SQLAlchemy as the `postgres` role (the
table owner). Table owners BYPASS RLS, so enabling RLS with no policies blocks
the public anon/authenticated roles while the backend keeps full access. We
intentionally add no policies because no client should reach these tables
except through the backend.
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        DECLARE r RECORD;
        BEGIN
            FOR r IN
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public'
            LOOP
                EXECUTE format(
                    'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;',
                    r.tablename
                );
            END LOOP;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        DECLARE r RECORD;
        BEGIN
            FOR r IN
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public'
            LOOP
                EXECUTE format(
                    'ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;',
                    r.tablename
                );
            END LOOP;
        END $$;
        """
    )
