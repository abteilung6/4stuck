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

def test_list_teams():
    # Initially, no teams
    response = client.get("/team/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

    # Create two teams
    client.post("/team/create", json={"name": "RedTeam"})
    client.post("/team/create", json={"name": "BlueTeam"})

    # Register users and join teams
    client.post("/team/register", json={"username": "alice"})
    client.post("/team/register", json={"username": "bob"})
    client.post("/team/register", json={"username": "carol"})
    # alice and bob join RedTeam, carol joins BlueTeam
    red_id = client.get("/team/").json()[0]["id"]
    blue_id = client.get("/team/").json()[1]["id"]
    client.post(f"/team/join?username=alice&team_id={red_id}")
    client.post(f"/team/join?username=bob&team_id={red_id}")
    client.post(f"/team/join?username=carol&team_id={blue_id}")

    # List teams and check members
    response = client.get("/team/")
    assert response.status_code == 200
    teams = response.json()
    assert len(teams) == 2
    red_team = next(t for t in teams if t["name"] == "RedTeam")
    blue_team = next(t for t in teams if t["name"] == "BlueTeam")
    red_members = {m["username"] for m in red_team["members"]}
    blue_members = {m["username"] for m in blue_team["members"]}
    assert red_members == {"alice", "bob"}
    assert blue_members == {"carol"} 