from tests.conftest import auth


def test_create_category(client, admin_token):
    r = client.post("/api/v1/services/categories", json={
        "name": "Plumbing",
        "description": "All plumbing services",
    }, headers=auth(admin_token))
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Plumbing"
    assert data["is_active"] is True


def test_create_category_non_admin(client, customer_token):
    r = client.post("/api/v1/services/categories", json={
        "name": "Electrician",
    }, headers=auth(customer_token))
    assert r.status_code == 403


def test_list_categories(client, category):
    r = client.get("/api/v1/services/categories")
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    assert category["name"] in names


def test_create_service(client, admin_token, category):
    r = client.post("/api/v1/services/", json={
        "category_id": category["id"],
        "name": "AC Repair",
        "price": 350.00,
        "duration_minutes": 90,
    }, headers=auth(admin_token))
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "AC Repair"
    assert data["price"] == 350.0


def test_create_service_invalid_category(client, admin_token):
    r = client.post("/api/v1/services/", json={
        "category_id": "00000000-0000-0000-0000-000000000000",
        "name": "Ghost Service",
        "price": 100.00,
    }, headers=auth(admin_token))
    assert r.status_code == 404


def test_list_services(client, service_item):
    r = client.get("/api/v1/services/")
    assert r.status_code == 200
    ids = [s["id"] for s in r.json()]
    assert service_item["id"] in ids


def test_get_service_by_id(client, service_item):
    r = client.get(f"/api/v1/services/{service_item['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == service_item["id"]


def test_update_service(client, admin_token, service_item):
    r = client.put(f"/api/v1/services/{service_item['id']}", json={
        "price": 599.00,
    }, headers=auth(admin_token))
    assert r.status_code == 200
    assert r.json()["price"] == 599.0


def test_delete_service(client, admin_token, category):
    # Create a throwaway service
    r = client.post("/api/v1/services/", json={
        "category_id": category["id"],
        "name": "Temp Service",
        "price": 100.00,
    }, headers=auth(admin_token))
    service_id = r.json()["id"]

    r = client.delete(f"/api/v1/services/{service_id}", headers=auth(admin_token))
    assert r.status_code == 204

    # Should no longer appear in active listing
    r = client.get("/api/v1/services/")
    ids = [s["id"] for s in r.json()]
    assert service_id not in ids
