from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_healthz():
    """Tests the /healthz endpoint."""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_readyz():
    """Tests the /readyz endpoint."""
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "db" in response.json()
