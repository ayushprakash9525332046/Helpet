# Helpet — Backend

FastAPI REST API backing the Helpet platform. See the [root README](../README.md) for architecture, environment variables and the full setup guide.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

alembic upgrade head          # apply migrations
python seed.py                # optional: demo catalogue + users

uvicorn app.main:app --reload # http://localhost:8000
pytest                        # test suite (uses a separate helpet_test DB)
```

Requires `backend/.env` with at least `DATABASE_URL` and `SECRET_KEY`. Without `RESEND_API_KEY`, OTP codes print to the console instead of being emailed.

## Layout

| Path | Contents |
| ---- | -------- |
| `app/api/v1/endpoints/` | Route handlers — auth, users, services, bookings, payments, reviews, notifications, admin |
| `app/core/` | Settings, security, email, shared dependencies |
| `app/models/` | SQLAlchemy tables |
| `app/schemas/` | Pydantic request/response contracts |
| `app/services/` | Business logic — auth, booking, notification, storage |
| `alembic/versions/` | Migrations |

Interactive API docs are served at `/docs` (Swagger) and `/redoc`.
