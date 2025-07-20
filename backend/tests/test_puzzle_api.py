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
    return client, tmp, TestingSessionLocal

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
    client, tmp, _ = create_test_app_and_client()
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
    client, tmp, _ = create_test_app_and_client()
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
    client, tmp, _ = create_test_app_and_client()
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

def test_player_elimination_and_game_over():
    client, tmp, TestingSessionLocal = create_test_app_and_client()
    # Create two users on the same team
    unique = str(uuid4())
    username1 = f"user1_{unique}"
    username2 = f"user2_{unique}"
    teamname = f"Team_{unique}"
    client.post("/team/register", json={"username": username1})
    client.post("/team/register", json={"username": username2})
    team_resp = client.post("/team/create", json={"name": teamname})
    team_id = team_resp.json()["id"]
    client.post(f"/team/join?username={username1}&team_id={team_id}")
    client.post(f"/team/join?username={username2}&team_id={team_id}")
    session_resp = client.post("/game/session", json={"team_id": team_id})
    session_id = session_resp.json()["id"]
    # Create puzzle for user1
    user1_id = client.get(f"/team/").json()[0]["members"][0]["id"]
    user2_id = client.get(f"/team/").json()[0]["members"][1]["id"]
    resp = client.post("/puzzle/create", json={"type": "memory", "game_session_id": session_id, "user_id": user1_id})
    puzzle = resp.json()
    # Set user1 points to 0 (simulate elimination)
    from app.models import User
    db = TestingSessionLocal()
    user1 = db.query(User).filter(User.id == user1_id).first()
    assert user1 is not None, "user1 not found in DB"
    setattr(user1, 'points', 0)
    db.commit()
    db.close()
    # Try to answer puzzle as eliminated user
    answer = puzzle["data"]["mapping"][str(puzzle["data"]["question_number"])]
    answer_resp = client.post("/puzzle/answer", json={"puzzle_id": puzzle["id"], "answer": answer})
    assert answer_resp.status_code == 400
    # Simulate user2 elimination and check game over logic (all points 0)
    db = TestingSessionLocal()
    user2 = db.query(User).filter(User.id == user2_id).first()
    assert user2 is not None, "user2 not found in DB"
    setattr(user2, 'points', 0)
    db.commit()
    db.close()
    # Get team points, all should be 0
    points_resp = client.get(f"/puzzle/points/{team_id}")
    points = points_resp.json()
    assert all(p["points"] == 0 for p in points["players"])
    tmp.close()

def test_create_concentration_puzzle():
    client, tmp, _ = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)
    
    # Create concentration puzzle
    resp = client.post("/puzzle/create", json={"type": "concentration", "game_session_id": session_id, "user_id": user_id})
    assert resp.status_code == 200
    puzzle = resp.json()
    assert puzzle["type"] == "concentration"
    assert "pairs" in puzzle["data"]
    assert "duration" in puzzle["data"]
    assert isinstance(puzzle["data"]["pairs"], list)
    assert len(puzzle["data"]["pairs"]) > 0
    assert "color_word" in puzzle["data"]["pairs"][0]
    assert "circle_color" in puzzle["data"]["pairs"][0]
    assert "is_match" in puzzle["data"]["pairs"][0]
    assert isinstance(puzzle["data"]["pairs"][0]["is_match"], bool)
    assert puzzle["correct_answer"].isdigit()  # Should be the index as string
    
    # Test correct answer (submit the correct index)
    answer_resp = client.post("/puzzle/answer", json={"puzzle_id": puzzle["id"], "answer": puzzle["correct_answer"]})
    assert answer_resp.status_code == 200
    result = answer_resp.json()
    assert result["correct"] is True
    
    tmp.close()

def test_memory_puzzle_data_structure():
    client, tmp, _ = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)
    
    # Create memory puzzle
    resp = client.post("/puzzle/create", json={"type": "memory", "game_session_id": session_id, "user_id": user_id})
    assert resp.status_code == 200
    puzzle = resp.json()
    
    # Verify puzzle structure
    assert puzzle["type"] == "memory"
    assert "data" in puzzle
    assert "mapping" in puzzle["data"]
    assert "question_number" in puzzle["data"]
    assert "choices" in puzzle["data"]
    
    # Verify data types
    assert isinstance(puzzle["data"]["mapping"], dict)
    assert isinstance(puzzle["data"]["question_number"], str)  # Should be string
    assert isinstance(puzzle["data"]["choices"], list)
    
    # Verify mapping structure (keys should be strings)
    mapping = puzzle["data"]["mapping"]
    assert len(mapping) > 0
    for key, value in mapping.items():
        assert isinstance(key, str)  # Keys should be strings
        assert isinstance(value, str)  # Values should be strings
    
    # Verify question_number exists in mapping
    question_number = puzzle["data"]["question_number"]
    assert question_number in mapping
    
    # Verify correct answer is in choices
    correct_answer = mapping[question_number]
    assert correct_answer in puzzle["data"]["choices"]
    
    # Test correct answer submission
    answer_resp = client.post("/puzzle/answer", json={"puzzle_id": puzzle["id"], "answer": correct_answer})
    assert answer_resp.status_code == 200
    result = answer_resp.json()
    assert result["correct"] is True
    
    tmp.close() 