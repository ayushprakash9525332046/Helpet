from tests.conftest import auth


def test_get_my_payments(client, customer_token, booking_item):
    client.post("/api/v1/payments/offline", json={
        "booking_id": booking_item["id"],
        "method": "cod",
    }, headers=auth(customer_token))

    r = client.get("/api/v1/payments/my", headers=auth(customer_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)
