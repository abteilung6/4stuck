import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Recreate the database before each test
    init_db()
    yield

def test_register_user():
    response = client.post("/team/register", json={"username": "alice"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "alice"
    assert "id" in data

    # Duplicate username should fail
    response = client.post("/team/register", json={"username": "alice"})
    assert response.status_code == 400


def test_create_team():
    response = client.post("/team/create", json={"name": "RedTeam"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "RedTeam"
    assert "id" in data

    # Duplicate team name should fail
    response = client.post("/team/create", json={"name": "RedTeam"})
    assert response.status_code == 400


def test_join_team():
    # Register user and create team
    user_resp = client.post("/team/register", json={"username": "bob"})
    team_resp = client.post("/team/create", json={"name": "BlueTeam"})
    user_id = user_resp.json()["id"]
    team_id = team_resp.json()["id"]

    # Join team
    response = client.post(f"/team/join?username=bob&team_id={team_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "bob"
    assert data["team_id"] == team_id

    # Joining with non-existent user
    response = client.post(f"/team/join?username=ghost&team_id={team_id}")
    assert response.status_code == 404

    # Joining with non-existent team
    response = client.post(f"/team/join?username=bob&team_id=9999")
    assert response.status_code == 404 