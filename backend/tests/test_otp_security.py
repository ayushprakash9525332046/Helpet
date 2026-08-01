import uuid
from datetime import datetime, timezone, timedelta

from tests.conftest import _unique_phone
from app.models.otp import OTP, OTPPurpose


def _unique_email():
    return f"otp_{uuid.uuid4().hex[:10]}@example.com"


def _register(client, email):
    r = client.post("/api/v1/auth/register", json={
        "full_name": "OTP Test User",
        "phone": _unique_phone(),
        "email": email,
        "password": "password123",
        "role": "customer",
    })
    assert r.status_code == 201
    return r.json()


def _latest_otp(db, email, purpose):
    return (
        db.query(OTP)
        .filter(OTP.email == email, OTP.purpose == purpose)
        .order_by(OTP.created_at.desc())
        .first()
    )


def test_otp_locks_after_max_attempts(client, db):
    email = _unique_email()
    _register(client, email)

    r = client.post("/api/v1/auth/otp/send", json={"email": email, "purpose": "login"})
    assert r.status_code == 200
    otp = _latest_otp(db, email, OTPPurpose.LOGIN)
    correct_code = otp.code

    for _ in range(5):
        r = client.post("/api/v1/auth/otp/verify-login", json={"email": email, "code": "000000"})
        assert r.status_code == 400

    # Even the correct code is now rejected — the OTP is locked out.
    r = client.post("/api/v1/auth/otp/verify-login", json={"email": email, "code": correct_code})
    assert r.status_code == 400
    assert "too many" in r.json()["detail"].lower()


def test_otp_verify_succeeds_within_attempt_limit(client, db):
    email = _unique_email()
    _register(client, email)

    client.post("/api/v1/auth/otp/send", json={"email": email, "purpose": "login"})
    otp = _latest_otp(db, email, OTPPurpose.LOGIN)
    correct_code = otp.code

    # A couple of typos shouldn't burn the whole budget.
    client.post("/api/v1/auth/otp/verify-login", json={"email": email, "code": "111111"})
    client.post("/api/v1/auth/otp/verify-login", json={"email": email, "code": "222222"})

    r = client.post("/api/v1/auth/otp/verify-login", json={"email": email, "code": correct_code})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_resend_invalidates_previous_otp(client, db):
    email = _unique_email()
    _register(client, email)

    client.post("/api/v1/auth/otp/send", json={"email": email, "purpose": "login"})
    first_otp = _latest_otp(db, email, OTPPurpose.LOGIN)
    first_code = first_otp.code

    # Bypass the 60s resend cooldown by backdating the first OTP.
    first_otp.created_at = datetime.now(timezone.utc) - timedelta(seconds=61)
    db.commit()

    r = client.post("/api/v1/auth/otp/send", json={"email": email, "purpose": "login"})
    assert r.status_code == 200

    # The old code must no longer work, even though it hasn't expired.
    r = client.post("/api/v1/auth/otp/verify-login", json={"email": email, "code": first_code})
    assert r.status_code == 400
