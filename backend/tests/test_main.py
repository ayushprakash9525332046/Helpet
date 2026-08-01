def test_debug_endpoint_removed(client):
    r = client.get("/debug")
    assert r.status_code == 404


def test_health_check_still_works(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
