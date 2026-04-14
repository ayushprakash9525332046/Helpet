from tests.conftest import auth


def test_get_my_profile(client, customer_token, customer):
    r = client.get("/api/v1/users/me", headers=auth(customer_token))
    assert r.status_code == 200
    assert r.json()["id"] == customer["id"]


def test_update_my_profile(client, customer_token):
    r = client.put(
        "/api/v1/users/me",
        json={
            "full_name": "Updated Name",
            "city": "Dehradun",
            "pincode": "248008",
        },
        headers=auth(customer_token),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["full_name"] == "Updated Name"


def test_get_all_users_admin(client, admin_token, customer):
    r = client.get("/api/v1/users/", headers=auth(admin_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_get_all_users_non_admin(client, customer_token):
    r = client.get("/api/v1/users/", headers=auth(customer_token))
    assert r.status_code == 403


def test_get_user_by_id(client, admin_token, customer):
    r = client.get(f"/api/v1/users/{customer['id']}", headers=auth(admin_token))
    assert r.status_code == 200
    assert r.json()["id"] == customer["id"]


def test_get_user_not_found(client, admin_token):
    r = client.get("/api/v1/users/00000000-0000-0000-0000-000000000000", headers=auth(admin_token))
    assert r.status_code == 404
