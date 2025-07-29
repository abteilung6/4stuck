from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.routers.game import (
    get_db as get_db_game,
    router as game_router,
)
from app.routers.team import (
    get_db as get_db_team,
    router as team_router,
)


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
    assert data["status"] == "countdown"

    # Creating another session for the same team should fail
    resp2 = client.post("/game/session", json={"team_id": team_id})
    assert resp2.status_code == 400
    assert "Game session already exists" in resp2.text
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
    assert data["status"] == "countdown"
    tmp.close()


def test_create_session_invalid_team():
    client, tmp = create_test_app_and_client()
    # Team does not exist
    resp = client.post("/game/session", json={"team_id": 9999})
    assert resp.status_code == 404
    assert "Team not found" in resp.text
    tmp.close()


def test_game_session_state_transitions_and_survival_time():
    import time as pytime

    client, tmp = create_test_app_and_client()
    _, team_id = create_team_and_user(client)
    # Create session (should start in countdown)
    resp = client.post("/game/session", json={"team_id": team_id})
    assert resp.status_code == 200
    session = resp.json()
    session_id = session["id"]
    assert session["status"] == "countdown"
    assert session["started_at"] is None
    assert session["ended_at"] is None
    assert session["survival_time_seconds"] is None

    # Move to active (should set started_at)
    resp = client.post(f"/game/session/{session_id}/state", json={"status": "active"})
    assert resp.status_code == 200
    session = resp.json()
    assert session["status"] == "active"
    assert session["started_at"] is not None
    assert session["ended_at"] is None
    assert session["survival_time_seconds"] is None
    started_at = session["started_at"]

    # Simulate some time passing
    pytime.sleep(1)

    # Move to finished (should set ended_at and survival_time_seconds)
    resp = client.post(f"/game/session/{session_id}/state", json={"status": "finished"})
    assert resp.status_code == 200
    session = resp.json()
    assert session["status"] == "finished"
    assert session["ended_at"] is not None
    assert session["survival_time_seconds"] is not None
    # Survival time should be at least 1 second
    assert session["survival_time_seconds"] >= 1
    tmp.close()


@pytest.mark.parametrize(
    "transitions, should_succeed",
    [
        (["countdown", "active"], True),
        (["countdown", "finished"], False),
        (["countdown", "active", "finished"], True),
    ],
)
def test_state_transition_paths(transitions, should_succeed):
    client, tmp = create_test_app_and_client()
    _, team_id = create_team_and_user(client)
    # Create session (should start in countdown)
    resp = client.post("/game/session", json={"team_id": team_id})
    assert resp.status_code == 200
    session = resp.json()
    session_id = session["id"]
    assert session["status"] == "countdown"

    current_status = "countdown"
    success = True
    for next_status in transitions[1:]:
        resp = client.post(f"/game/session/{session_id}/state", json={"status": next_status})
        if resp.status_code == 200:
            session = resp.json()
            current_status = session["status"]
        else:
            success = False
            break
    assert success == should_succeed
    tmp.close()
