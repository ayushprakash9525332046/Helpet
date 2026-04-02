from unittest.mock import patch
from tests.conftest import auth


MOCK_RZ_ORDER = {
    "id": "order_test_ABC123",
    "amount": 49900,
    "currency": "INR",
}


def test_create_payment_order(client, customer_token, booking_item):
    with patch("app.api.v1.endpoints.payments.payment_service.create_razorpay_order",
               return_value=MOCK_RZ_ORDER):
        r = client.post("/api/v1/payments/create-order", json={
            "booking_id": booking_item["id"],
        }, headers=auth(customer_token))
    assert r.status_code == 201
    data = r.json()
    assert data["razorpay_order_id"] == "order_test_ABC123"
    assert data["currency"] == "INR"


def test_create_payment_order_another_users_booking(client, provider_token, booking_item):
    with patch("app.api.v1.endpoints.payments.payment_service.create_razorpay_order",
               return_value=MOCK_RZ_ORDER):
        r = client.post("/api/v1/payments/create-order", json={
            "booking_id": booking_item["id"],
        }, headers=auth(provider_token))
    assert r.status_code == 403


def test_verify_payment_valid_signature(client, customer_token, service_item):
    # Create a dedicated booking for this test to avoid order ID collisions
    r = client.post("/api/v1/bookings/", json={
        "service_id": service_item["id"],
        "scheduled_at": "2026-10-01T10:00:00Z",
        "address": "Verify Test Address",
    }, headers=auth(customer_token))
    b_id = r.json()["id"]

    unique_order = {**MOCK_RZ_ORDER, "id": "order_verify_unique_001"}
    with patch("app.api.v1.endpoints.payments.payment_service.create_razorpay_order",
               return_value=unique_order):
        client.post("/api/v1/payments/create-order", json={"booking_id": b_id},
                    headers=auth(customer_token))

    with patch("app.api.v1.endpoints.payments.payment_service.verify_signature",
               return_value=True):
        r = client.post("/api/v1/payments/verify", json={
            "razorpay_order_id": "order_verify_unique_001",
            "razorpay_payment_id": "pay_FAKE123",
            "razorpay_signature": "fakesig",
        }, headers=auth(customer_token))
    assert r.status_code == 200
    assert r.json()["status"] == "success"


def test_verify_payment_invalid_signature(client, customer_token, service_item):
    # Create a booking and order for this test
    from tests.conftest import _unique_phone
    r = client.post("/api/v1/bookings/", json={
        "service_id": service_item["id"],
        "scheduled_at": "2026-09-01T10:00:00Z",
        "address": "Sig Test Address",
    }, headers=auth(customer_token))
    b_id = r.json()["id"]

    mock_order = {**MOCK_RZ_ORDER, "id": "order_badsig_XYZ"}
    with patch("app.api.v1.endpoints.payments.payment_service.create_razorpay_order",
               return_value=mock_order):
        client.post("/api/v1/payments/create-order", json={"booking_id": b_id},
                    headers=auth(customer_token))

    with patch("app.api.v1.endpoints.payments.payment_service.verify_signature",
               return_value=False):
        r = client.post("/api/v1/payments/verify", json={
            "razorpay_order_id": "order_badsig_XYZ",
            "razorpay_payment_id": "pay_FAKE",
            "razorpay_signature": "badsig",
        }, headers=auth(customer_token))
    assert r.status_code == 400


def test_get_my_payments(client, customer_token, booking_item):
    with patch("app.api.v1.endpoints.payments.payment_service.create_razorpay_order",
               return_value={**MOCK_RZ_ORDER, "id": "order_my_pay_test"}):
        client.post("/api/v1/payments/create-order", json={"booking_id": booking_item["id"]},
                    headers=auth(customer_token))

    r = client.get("/api/v1/payments/my", headers=auth(customer_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)
