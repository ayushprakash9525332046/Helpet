import uuid
from decimal import Decimal
from datetime import datetime, timezone

from tests.conftest import auth, _unique_phone
from app.models.payment import Payment
from app.models.service import ServiceCategory, Service
from app.models.booking import Booking


def _customer(client, email):
    phone = _unique_phone()
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Payment Test Customer",
        "phone": phone,
        "email": email,
        "password": "testpass123",
        "role": "customer",
    })
    assert r.status_code == 201
    customer_id = r.json()["id"]

    r = client.post("/api/v1/auth/login", data={"username": phone, "password": "testpass123"})
    assert r.status_code == 200
    return customer_id, r.json()["access_token"]


def _booking_for(db, customer_id):
    """Build category/service/booking directly via the DB, bypassing the
    admin-bootstrap fixture chain in conftest.py (broken independently of this
    change: admin_user constructs a User() without email, which now violates
    the NOT NULL constraint on users.email)."""
    category = ServiceCategory(name="Payment Test Category")
    db.add(category)
    db.commit()
    db.refresh(category)

    service = Service(category_id=category.id, name="Payment Test Service", price=Decimal("500.00"))
    db.add(service)
    db.commit()
    db.refresh(service)

    booking = Booking(
        customer_id=uuid.UUID(customer_id),
        service_id=service.id,
        scheduled_at=datetime.now(timezone.utc),
        address="123 Payment Test Street, Dehradun",
        total_amount=Decimal("500.00"),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def test_offline_payment_rejects_non_cod_method(client, db):
    customer_id, token = _customer(client, "payment_reject@example.com")
    booking = _booking_for(db, customer_id)

    r = client.post("/api/v1/payments/offline", json={
        "booking_id": str(booking.id),
        "method": "upi",
    }, headers=auth(token))
    assert r.status_code == 422


def test_offline_payment_rejected_method_creates_no_payment(client, db):
    customer_id, token = _customer(client, "payment_reject_nopay@example.com")
    booking = _booking_for(db, customer_id)

    client.post("/api/v1/payments/offline", json={
        "booking_id": str(booking.id),
        "method": "upi",
    }, headers=auth(token))

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    assert payment is None


def test_offline_payment_cod_still_works(client, db):
    customer_id, token = _customer(client, "payment_cod@example.com")
    booking = _booking_for(db, customer_id)

    r = client.post("/api/v1/payments/offline", json={
        "booking_id": str(booking.id),
        "method": "cod",
    }, headers=auth(token))
    assert r.status_code == 201
    assert r.json()["status"] == "pending"
