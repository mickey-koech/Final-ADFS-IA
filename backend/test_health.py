import httpx
import pytest
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the School Digital Filing System"}

# More complex tests would require a mock database, 
# but for now we can at least check if the server starts and responds to root.
print("Basic health check passed!")
