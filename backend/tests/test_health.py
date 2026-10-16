def test_health_check(client):
    """Test /health liveness probe returns 200 OK and valid payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CampusStock"
    assert "version" in data


def test_ready_check(client):
    """Test /ready readiness probe returns 200 when ready or 503."""
    response = client.get("/ready")
    # Response should be a valid status code (200 or 503 depending on db ping)
    assert response.status_code in (200, 503)
    data = response.json()
    assert "status" in data


def test_root_endpoint(client):
    """Test root endpoint returns service discovery links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "CampusStock"
    assert data["docs"] == "/docs"
