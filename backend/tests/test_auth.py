from tests.conftest import auth, _unique_phone, _unique_email


def test_register_success(client):
    phone = _unique_phone()
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Ramesh Kumar",
        "phone": phone,
        "email": _unique_email(),
        "password": "password123",
        "role": "customer",
    })
    assert r.status_code == 201
    data = r.json()
    assert data["phone"] == phone
    assert data["role"] == "customer"
    assert "id" in data


def test_register_duplicate_phone(client):
    phone = _unique_phone()
    payload = {
        "full_name": "A", "phone": phone, "email": _unique_email(),
        "password": "pass123", "role": "customer",
    }
    client.post("/api/v1/auth/register", json=payload)
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 400
    assert "already registered" in r.json()["detail"]


def test_login_success(client):
    phone = _unique_phone()
    client.post("/api/v1/auth/register", json={
        "full_name": "Login User",
        "phone": phone,
        "email": _unique_email(),
        "password": "mypassword",
        "role": "customer",
    })
    r = client.post("/api/v1/auth/login", data={"username": phone, "password": "mypassword"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["phone"] == phone


def test_login_wrong_password(client):
    phone = _unique_phone()
    client.post("/api/v1/auth/register", json={
        "full_name": "User", "phone": phone, "email": _unique_email(),
        "password": "correct", "role": "customer",
    })
    r = client.post("/api/v1/auth/login", data={"username": phone, "password": "wrong"})
    assert r.status_code == 401


def test_get_me(client, customer_token):
    r = client.get("/api/v1/auth/me", headers=auth(customer_token))
    assert r.status_code == 200
    assert "id" in r.json()


def test_get_me_no_token(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401
