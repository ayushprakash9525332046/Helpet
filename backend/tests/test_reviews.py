from tests.conftest import auth


def test_create_review(client, customer_token, provider, completed_booking):
    r = client.post("/api/v1/reviews/", json={
        "booking_id": completed_booking["id"],
        "provider_id": provider["id"],
        "rating": 5,
        "comment": "Excellent service!",
    }, headers=auth(customer_token))
    assert r.status_code == 201
    data = r.json()
    assert data["rating"] == 5
    assert data["comment"] == "Excellent service!"


def test_create_review_pending_booking(client, customer_token, provider, booking_item):
    """Cannot review a booking that isn't completed."""
    r = client.post("/api/v1/reviews/", json={
        "booking_id": booking_item["id"],
        "provider_id": provider["id"],
        "rating": 4,
    }, headers=auth(customer_token))
    assert r.status_code == 400


def test_create_review_invalid_rating(client, customer_token, provider, completed_booking):
    r = client.post("/api/v1/reviews/", json={
        "booking_id": completed_booking["id"],
        "provider_id": provider["id"],
        "rating": 6,   # out of range
    }, headers=auth(customer_token))
    assert r.status_code == 422


def test_duplicate_review(client, customer_token, provider, completed_booking):
    payload = {
        "booking_id": completed_booking["id"],
        "provider_id": provider["id"],
        "rating": 3,
    }
    client.post("/api/v1/reviews/", json=payload, headers=auth(customer_token))
    r = client.post("/api/v1/reviews/", json=payload, headers=auth(customer_token))
    assert r.status_code == 409


def test_get_provider_reviews(client, customer_token, provider, completed_booking):
    client.post("/api/v1/reviews/", json={
        "booking_id": completed_booking["id"],
        "provider_id": provider["id"],
        "rating": 4,
    }, headers=auth(customer_token))

    r = client.get(f"/api/v1/reviews/provider/{provider['id']}")
    assert r.status_code == 200
    assert any(rv["provider_id"] == provider["id"] for rv in r.json())


def test_get_my_reviews(client, customer_token, provider, completed_booking):
    client.post("/api/v1/reviews/", json={
        "booking_id": completed_booking["id"],
        "provider_id": provider["id"],
        "rating": 5,
    }, headers=auth(customer_token))

    r = client.get("/api/v1/reviews/my", headers=auth(customer_token))
    assert r.status_code == 200
    assert len(r.json()) >= 1
