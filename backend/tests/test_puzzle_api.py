import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
from app.routers.team import router as team_router, get_db as get_db_team
from app.routers.game import router as game_router, get_db as get_db_game
from app.routers.puzzle import router as puzzle_router, get_db as get_db_puzzle
from uuid import uuid4

# Helper to create a fresh app and DB for each test
def create_test_app_and_client():
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
    app.include_router(puzzle_router)
    app.dependency_overrides[get_db_team] = override_get_db
    app.dependency_overrides[get_db_game] = override_get_db
    app.dependency_overrides[get_db_puzzle] = override_get_db
    client = TestClient(app)
    return client, tmp

def create_team_user_session(client):
    unique = str(uuid4())
    username = f"testuser_{unique}"
    teamname = f"TestTeam_{unique}"
    user_resp = client.post("/team/register", json={"username": username})
    team_resp = client.post("/team/create", json={"name": teamname})
    user_id = user_resp.json()["id"]
    team_id = team_resp.json()["id"]
    join_resp = client.post(f"/team/join?username={username}&team_id={team_id}")
    session_resp = client.post("/game/session", json={"team_id": team_id})
    session_id = session_resp.json()["id"]
    return user_id, team_id, session_id

def test_create_and_get_puzzle():
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)
    # Create puzzle
    resp = client.post("/puzzle/create", json={"type": "memory", "game_session_id": session_id, "user_id": user_id})
    assert resp.status_code == 200
    puzzle = resp.json()
    assert puzzle["type"] == "memory"
    # Get current puzzle
    resp2 = client.get(f"/puzzle/current/{user_id}")
    assert resp2.status_code == 200
    assert resp2.json()["id"] == puzzle["id"]
    tmp.close()

def test_submit_answer_correct_and_incorrect():
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)
    # Create puzzle
    resp = client.post("/puzzle/create", json={"type": "memory", "game_session_id": session_id, "user_id": user_id})
    puzzle = resp.json()
    # Correct answer
    correct = puzzle["data"]["mapping"][str(puzzle["data"]["question_number"])]
    answer_resp = client.post("/puzzle/answer", json={"puzzle_id": puzzle["id"], "answer": correct})
    assert answer_resp.status_code == 200
    result = answer_resp.json()
    assert result["correct"] is True
    assert result["points_awarded"] in [0, 5]
    assert result["next_puzzle_id"] is not None
    # Incorrect answer
    wrong = "notacolor"
    answer_resp2 = client.post("/puzzle/answer", json={"puzzle_id": result["next_puzzle_id"], "answer": wrong})
    assert answer_resp2.status_code == 200
    result2 = answer_resp2.json()
    assert result2["correct"] is False
    tmp.close()

def test_team_points_and_decay():
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)
    # Get team points
    resp = client.get(f"/puzzle/points/{team_id}")
    assert resp.status_code == 200
    points = resp.json()
    assert points["team_id"] == team_id
    assert any(p["user_id"] == user_id for p in points["players"])
    # Decay points
    resp2 = client.post(f"/puzzle/decay/{team_id}")
    assert resp2.status_code == 200
    tmp.close() 