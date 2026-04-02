from tests.conftest import auth
from app.models.notification import Notification, NotificationType


def _seed_notification(db, user_id):
    n = Notification(
        user_id=user_id,
        title="Test Notification",
        message="You have a new update.",
        type=NotificationType.GENERAL,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def test_get_my_notifications(client, db, customer_token, customer):
    _seed_notification(db, customer["id"])
    r = client.get("/api/v1/notifications/my", headers=auth(customer_token))
    assert r.status_code == 200
    assert len(r.json()) >= 1
    assert r.json()[0]["title"] == "Test Notification"


def test_mark_notification_read(client, db, customer_token, customer):
    n = _seed_notification(db, customer["id"])
    r = client.put(f"/api/v1/notifications/{n.id}/read", headers=auth(customer_token))
    assert r.status_code == 200
    assert r.json()["is_read"] is True


def test_mark_notification_read_wrong_user(client, db, provider_token, customer):
    n = _seed_notification(db, customer["id"])
    r = client.put(f"/api/v1/notifications/{n.id}/read", headers=auth(provider_token))
    assert r.status_code == 403


def test_mark_all_read(client, db, customer_token, customer):
    _seed_notification(db, customer["id"])
    _seed_notification(db, customer["id"])
    r = client.put("/api/v1/notifications/read-all", headers=auth(customer_token))
    assert r.status_code == 200

    # All should now be read
    r2 = client.get("/api/v1/notifications/my", headers=auth(customer_token))
    assert all(n["is_read"] for n in r2.json())
