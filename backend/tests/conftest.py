"""
Shared test fixtures.

Strategy:
- Create a separate `helpet_test` postgres database.
- Drop + recreate all tables once per session (clean slate).
- Each test gets its own DB session; committed data is visible across fixtures.
- The TestClient overrides get_db to use the test session factory.
"""

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole

# Import all models so Base.metadata is fully populated
from app.models import user, service, booking, payment, review, notification  # noqa

# ── Test DB ─────────────────────────────────────────────────────

_base_url = settings.DATABASE_URL.rsplit("/", 1)[0]
TEST_DB_URL = _base_url + "/helpet_test"


def _ensure_test_db():
    """Create helpet_test database if it doesn't exist."""
    admin_engine = create_engine(_base_url + "/postgres", isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'helpet_test'")
            ).fetchone()
            if not exists:
                conn.execute(text("CREATE DATABASE helpet_test"))
    finally:
        admin_engine.dispose()


_ensure_test_db()

engine = create_engine(TEST_DB_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Session-scoped: create tables once ─────────────────────────

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ── Per-test DB session & client ────────────────────────────────

@pytest.fixture
def db(setup_database):
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(setup_database):
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Auth helpers ────────────────────────────────────────────────

import uuid as _uuid

def _unique_phone():
    return "9" + str(_uuid.uuid4().int)[:9]


@pytest.fixture
def customer_phone():
    return _unique_phone()


@pytest.fixture
def provider_phone():
    return _unique_phone()


@pytest.fixture
def admin_phone():
    return _unique_phone()


# ── Registered users ────────────────────────────────────────────

@pytest.fixture
def customer(client, customer_phone):
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Test Customer",
        "phone": customer_phone,
        "password": "testpass123",
        "role": "customer",
    })
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def provider(client, provider_phone):
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Test Provider",
        "phone": provider_phone,
        "password": "testpass123",
        "role": "provider",
    })
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def admin_user(db, admin_phone):
    """Admin users can't self-register — create directly in DB."""
    u = User(
        full_name="Test Admin",
        phone=admin_phone,
        hashed_password=hash_password("adminpass123"),
        role=UserRole.ADMIN,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


# ── Tokens ──────────────────────────────────────────────────────

@pytest.fixture
def customer_token(client, customer_phone, customer):
    r = client.post("/api/v1/auth/login", data={
        "username": customer_phone,
        "password": "testpass123",
    })
    assert r.status_code == 200
    return r.json()["access_token"]


@pytest.fixture
def provider_token(client, provider_phone, provider):
    r = client.post("/api/v1/auth/login", data={
        "username": provider_phone,
        "password": "testpass123",
    })
    assert r.status_code == 200
    return r.json()["access_token"]


@pytest.fixture
def admin_token(client, admin_phone, admin_user):
    r = client.post("/api/v1/auth/login", data={
        "username": admin_phone,
        "password": "adminpass123",
    })
    assert r.status_code == 200
    return r.json()["access_token"]


def auth(token):
    """Shortcut to build Authorization header dict."""
    return {"Authorization": f"Bearer {token}"}


# ── Domain fixtures ──────────────────────────────────────────────

@pytest.fixture
def category(client, admin_token):
    r = client.post("/api/v1/services/categories", json={
        "name": "Cleaning",
        "description": "Home cleaning services",
    }, headers=auth(admin_token))
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def service_item(client, admin_token, category):
    r = client.post("/api/v1/services/", json={
        "category_id": category["id"],
        "name": "Deep Clean 2BHK",
        "price": 499.00,
        "duration_minutes": 120,
    }, headers=auth(admin_token))
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def booking_item(client, customer_token, service_item):
    r = client.post(
        "/api/v1/bookings/",
        json={
            "service_id": service_item["id"],
            "scheduled_at": "2026-06-01T10:00:00Z",
            "address": "123 Test Street, Dehradun",
        },
        headers=auth(customer_token),
    )
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def completed_booking(db, booking_item):
    """Mark a booking as COMPLETED so reviews can be submitted."""
    from app.models.booking import Booking, BookingStatus
    b = db.query(Booking).filter(Booking.id == booking_item["id"]).first()
    b.status = BookingStatus.COMPLETED
    db.commit()
    return booking_item
