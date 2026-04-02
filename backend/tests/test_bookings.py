from tests.conftest import auth


def test_create_booking(client, customer_token, service_item):
    r = client.post("/api/v1/bookings/", json={
        "service_id": service_item["id"],
        "scheduled_at": "2026-07-01T09:00:00Z",
        "address": "456 MG Road, Bangalore",
    }, headers=auth(customer_token))
    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "pending"
    assert data["total_amount"] == service_item["price"]


def test_create_booking_invalid_service(client, customer_token):
    r = client.post("/api/v1/bookings/", json={
        "service_id": "00000000-0000-0000-0000-000000000000",
        "scheduled_at": "2026-07-01T09:00:00Z",
        "address": "Some address",
    }, headers=auth(customer_token))
    assert r.status_code == 404


def test_get_my_bookings(client, customer_token, booking_item):
    r = client.get("/api/v1/bookings/my", headers=auth(customer_token))
    assert r.status_code == 200
    ids = [b["id"] for b in r.json()]
    assert booking_item["id"] in ids


def test_get_booking_by_id(client, customer_token, booking_item):
    r = client.get(f"/api/v1/bookings/{booking_item['id']}", headers=auth(customer_token))
    assert r.status_code == 200
    assert r.json()["id"] == booking_item["id"]


def test_get_booking_unauthorized(client, provider_token, booking_item):
    r = client.get(f"/api/v1/bookings/{booking_item['id']}", headers=auth(provider_token))
    assert r.status_code == 403


def test_cancel_booking(client, customer_token, service_item):
    # Create a fresh booking to cancel
    r = client.post("/api/v1/bookings/", json={
        "service_id": service_item["id"],
        "scheduled_at": "2026-08-01T10:00:00Z",
        "address": "Cancel Test Address",
    }, headers=auth(customer_token))
    booking_id = r.json()["id"]

    r = client.delete(f"/api/v1/bookings/{booking_id}", headers=auth(customer_token))
    assert r.status_code == 204

    # Verify it's cancelled
    r = client.get(f"/api/v1/bookings/{booking_id}", headers=auth(customer_token))
    assert r.json()["status"] == "cancelled"


def test_update_booking_status(client, customer_token, booking_item, admin_token):
    r = client.put(f"/api/v1/bookings/{booking_item['id']}", json={
        "status": "confirmed"
    }, headers=auth(customer_token))
    assert r.status_code == 200
    assert r.json()["status"] == "confirmed"
