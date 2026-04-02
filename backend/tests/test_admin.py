from tests.conftest import auth


def test_admin_stats(client, admin_token, customer):
    r = client.get("/api/v1/admin/stats", headers=auth(admin_token))
    assert r.status_code == 200
    data = r.json()
    assert "total_users" in data
    assert "total_bookings" in data
    assert "total_revenue" in data
    assert data["total_users"] >= 1


def test_admin_stats_non_admin(client, customer_token):
    r = client.get("/api/v1/admin/stats", headers=auth(customer_token))
    assert r.status_code == 403


def test_admin_list_users(client, admin_token, customer, provider):
    r = client.get("/api/v1/admin/users", headers=auth(admin_token))
    assert r.status_code == 200
    ids = [u["id"] for u in r.json()]
    assert customer["id"] in ids
    assert provider["id"] in ids


def test_admin_update_user_status(client, admin_token, customer):
    r = client.put(
        f"/api/v1/admin/users/{customer['id']}/status",
        params={"new_status": "banned"},
        headers=auth(admin_token),
    )
    assert r.status_code == 200
    assert "banned" in r.json()["message"]


def test_admin_list_bookings(client, admin_token, booking_item):
    r = client.get("/api/v1/admin/bookings", headers=auth(admin_token))
    assert r.status_code == 200
    ids = [b["id"] for b in r.json()]
    assert booking_item["id"] in ids


def test_admin_list_payments(client, admin_token):
    r = client.get("/api/v1/admin/payments", headers=auth(admin_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)
