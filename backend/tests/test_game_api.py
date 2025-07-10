import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
from app.routers.team import router as team_router, get_db as get_db_team
from app.routers.game import router as game_router, get_db as get_db_game

# Helper to create a fresh app and DB for each test
def create_test_app_and_client():
    # Create a temporary SQLite DB
    import tempfile
    tmp = tempfile.NamedTemporaryFile(suffix=".db")
    TEST_DATABASE_URL = f"sqlite:///{tmp.name}"
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = FastAPI()
    app.include_router(team_router)
    app.include_router(game_router)
    app.dependency_overrides[get_db_team] = override_get_db
    app.dependency_overrides[get_db_game] = override_get_db
    client = TestClient(app)
    return client, tmp

def create_team_and_user(client):
    unique = str(uuid4())
    username = f"testuser_{unique}"
    teamname = f"TestTeam_{unique}"
    user_resp = client.post("/team/register", json={"username": username})
    team_resp = client.post("/team/create", json={"name": teamname})
    return user_resp.json()["id"], team_resp.json()["id"]

def test_create_game_session():
    client, tmp = create_test_app_and_client()
    _, team_id = create_team_and_user(client)
    # Create a new game session
    resp = client.post("/game/session", json={"team_id": team_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["team_id"] == team_id
    assert data["status"] == "active"

    # Creating another active session for the same team should fail
    resp2 = client.post("/game/session", json={"team_id": team_id})
    assert resp2.status_code == 400
    assert "Active game session already exists" in resp2.text
    tmp.close()

def test_get_current_session():
    client, tmp = create_test_app_and_client()
    _, team_id = create_team_and_user(client)
    # No session yet
    resp = client.get(f"/game/session/{team_id}")
    assert resp.status_code == 404
    # Create session
    client.post("/game/session", json={"team_id": team_id})
    # Now should succeed
    resp2 = client.get(f"/game/session/{team_id}")
    assert resp2.status_code == 200
    data = resp2.json()
    assert data["team_id"] == team_id
    assert data["status"] == "active"
    tmp.close()

def test_create_session_invalid_team():
    client, tmp = create_test_app_and_client()
    # Team does not exist
    resp = client.post("/game/session", json={"team_id": 9999})
    assert resp.status_code == 404
    assert "Team not found" in resp.text
    tmp.close() 