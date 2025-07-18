import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models import Base
from app.routers.team import router as team_router, get_db as get_db_team
from app.routers.game import router as game_router, get_db as get_db_game
from app.routers.puzzle import router as puzzle_router, get_db as get_db_puzzle, submit_answer
from app.schemas import PuzzleAnswer, PuzzleResult
import random
import tempfile

# Helper to create a fresh app and DB for each test
def create_test_app_and_client():
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

class TestSpatialPuzzleNextTask:
    """Test suite for spatial puzzle next task functionality"""
    
    def test_spatial_puzzle_solved_returns_next_puzzle(self):
        """Test that solving a spatial puzzle returns the next puzzle in the response"""
        client, tmp, _ = create_test_app_and_client()
        
        try:
            # Create team and users using API
            from uuid import uuid4
            unique = str(uuid4())
            username1 = f"user1_{unique}"
            username2 = f"user2_{unique}"
            teamname = f"TestTeam_{unique}"
            
            # Register users
            user1_resp = client.post("/team/register", json={"username": username1})
            user2_resp = client.post("/team/register", json={"username": username2})
            user1_id = user1_resp.json()["id"]
            user2_id = user2_resp.json()["id"]
            
            # Create team
            team_resp = client.post("/team/create", json={"name": teamname})
            team_id = team_resp.json()["id"]
            
            # Join team
            client.post(f"/team/join?username={username1}&team_id={team_id}")
            client.post(f"/team/join?username={username2}&team_id={team_id}")
            
            # Create game session
            session_resp = client.post("/game/session", json={"team_id": team_id})
            session_id = session_resp.json()["id"]
            
            # Wait for session to become active
            import time
            time.sleep(6)
            
            # Create spatial puzzle
            puzzle_resp = client.post("/puzzle/create", json={
                "type": "spatial", 
                "game_session_id": session_id, 
                "user_id": user1_id
            })
            assert puzzle_resp.status_code == 200
            puzzle = puzzle_resp.json()
            
            # Submit correct answer
            answer_resp = client.post("/puzzle/answer", json={
                "puzzle_id": puzzle["id"], 
                "answer": "solved"
            })
            assert answer_resp.status_code == 200
            result = answer_resp.json()
            
            # Verify the result
            assert result["correct"] is True
            assert result["next_puzzle_id"] is not None
            assert result["next_puzzle"] is not None
            assert result["next_puzzle"]["type"] in ["memory", "spatial", "concentration", "multitasking"]
            assert result["next_puzzle"]["status"] == "active"
            
            # Verify the next puzzle can be fetched
            next_puzzle_resp = client.get(f"/puzzle/current/{user1_id}")
            assert next_puzzle_resp.status_code == 200
            next_puzzle = next_puzzle_resp.json()
            assert next_puzzle["id"] == result["next_puzzle_id"]
            
        finally:
            tmp.close()
    
    def test_spatial_puzzle_failed_returns_next_puzzle(self):
        """Test that failing a spatial puzzle returns a next puzzle (new behavior)"""
        client, tmp, _ = create_test_app_and_client()
        
        try:
            # Create team and user using API
            from uuid import uuid4
            unique = str(uuid4())
            username = f"user1_{unique}"
            teamname = f"TestTeam_{unique}"
            
            # Register user
            user_resp = client.post("/team/register", json={"username": username})
            user_id = user_resp.json()["id"]
            
            # Create team
            team_resp = client.post("/team/create", json={"name": teamname})
            team_id = team_resp.json()["id"]
            
            # Join team
            client.post(f"/team/join?username={username}&team_id={team_id}")
            
            # Create game session
            session_resp = client.post("/game/session", json={"team_id": team_id})
            session_id = session_resp.json()["id"]
            
            # Wait for session to become active
            import time
            time.sleep(6)
            
            # Create spatial puzzle
            puzzle_resp = client.post("/puzzle/create", json={
                "type": "spatial", 
                "game_session_id": session_id, 
                "user_id": user_id
            })
            assert puzzle_resp.status_code == 200
            puzzle = puzzle_resp.json()
            
            # Submit incorrect answer
            answer_resp = client.post("/puzzle/answer", json={
                "puzzle_id": puzzle["id"], 
                "answer": "collision"
            })
            assert answer_resp.status_code == 200
            result = answer_resp.json()
            
            # Verify the result (new behavior: failed puzzles return next puzzle)
            assert result["correct"] is False
            assert result["next_puzzle_id"] is not None
            assert result["next_puzzle"] is not None
            assert result["next_puzzle"]["status"] == "active"
            
            # Verify the next puzzle can be fetched
            next_puzzle_resp = client.get(f"/puzzle/current/{user_id}")
            assert next_puzzle_resp.status_code == 200
            next_puzzle = next_puzzle_resp.json()
            assert next_puzzle["id"] == result["next_puzzle_id"]
            
        finally:
            tmp.close()
    
    def test_spatial_puzzle_next_puzzle_randomization(self):
        """Test that the next puzzle type is randomly selected"""
        client, tmp, _ = create_test_app_and_client()
        
        try:
            # Create team and user using API
            from uuid import uuid4
            unique = str(uuid4())
            username = f"user1_{unique}"
            teamname = f"TestTeam_{unique}"
            
            # Register user
            user_resp = client.post("/team/register", json={"username": username})
            user_id = user_resp.json()["id"]
            
            # Create team
            team_resp = client.post("/team/create", json={"name": teamname})
            team_id = team_resp.json()["id"]
            
            # Join team
            client.post(f"/team/join?username={username}&team_id={team_id}")
            
            # Create game session
            session_resp = client.post("/game/session", json={"team_id": team_id})
            session_id = session_resp.json()["id"]
            
            # Wait for session to become active
            import time
            time.sleep(6)
            
            # Test multiple solves to verify randomization
            puzzle_types = []
            for i in range(5):  # Reduced to 5 for faster testing
                # Create spatial puzzle
                puzzle_resp = client.post("/puzzle/create", json={
                    "type": "spatial", 
                    "game_session_id": session_id, 
                    "user_id": user_id
                })
                assert puzzle_resp.status_code == 200
                puzzle = puzzle_resp.json()
                
                # Submit correct answer
                answer_resp = client.post("/puzzle/answer", json={
                    "puzzle_id": puzzle["id"], 
                    "answer": "solved"
                })
                assert answer_resp.status_code == 200
                result = answer_resp.json()
                
                # Record the next puzzle type
                if result["next_puzzle"]:
                    puzzle_types.append(result["next_puzzle"]["type"])
            
            # Verify we got different puzzle types (not all the same)
            unique_types = set(puzzle_types)
            assert len(unique_types) > 1, f"Expected different puzzle types, got: {puzzle_types}"
            
            # Verify all types are valid
            valid_types = {"memory", "spatial", "concentration", "multitasking"}
            assert all(puzzle_type in valid_types for puzzle_type in puzzle_types)
            
        finally:
            tmp.close()
    
    def test_spatial_puzzle_points_awarded_to_next_player(self):
        """Test that solving a spatial puzzle awards points to the next player in the team"""
        client, tmp, _ = create_test_app_and_client()
        
        try:
            # Create team and users using API
            from uuid import uuid4
            unique = str(uuid4())
            username1 = f"user1_{unique}"
            username2 = f"user2_{unique}"
            username3 = f"user3_{unique}"
            teamname = f"TestTeam_{unique}"
            
            # Register users
            user1_resp = client.post("/team/register", json={"username": username1})
            user2_resp = client.post("/team/register", json={"username": username2})
            user3_resp = client.post("/team/register", json={"username": username3})
            user1_id = user1_resp.json()["id"]
            user2_id = user2_resp.json()["id"]
            user3_id = user3_resp.json()["id"]
            
            # Create team
            team_resp = client.post("/team/create", json={"name": teamname})
            team_id = team_resp.json()["id"]
            
            # Join team
            client.post(f"/team/join?username={username1}&team_id={team_id}")
            client.post(f"/team/join?username={username2}&team_id={team_id}")
            client.post(f"/team/join?username={username3}&team_id={team_id}")
            
            # Create game session
            session_resp = client.post("/game/session", json={"team_id": team_id})
            session_id = session_resp.json()["id"]
            
            # Wait for session to become active
            import time
            time.sleep(6)
            
            # Create spatial puzzle for user1
            puzzle_resp = client.post("/puzzle/create", json={
                "type": "spatial", 
                "game_session_id": session_id, 
                "user_id": user1_id
            })
            assert puzzle_resp.status_code == 200
            puzzle = puzzle_resp.json()
            
            # Submit correct answer
            answer_resp = client.post("/puzzle/answer", json={
                "puzzle_id": puzzle["id"], 
                "answer": "solved"
            })
            assert answer_resp.status_code == 200
            result = answer_resp.json()
            
            # Verify points were awarded to user2 (next player)
            assert result["correct"] is True
            assert result["awarded_to_user_id"] == user2_id
            assert result["points_awarded"] == 5
            
            # Verify user2's points increased by checking team points
            points_resp = client.get(f"/puzzle/points/{team_id}")
            assert points_resp.status_code == 200
            points = points_resp.json()
            user2_points = next(p["points"] for p in points["players"] if p["user_id"] == user2_id)
            assert user2_points == 20  # 15 + 5
            
        finally:
            tmp.close()
    
    def test_spatial_puzzle_no_points_if_next_player_eliminated(self):
        """Test that no points are awarded if the next player is eliminated (0 points)"""
        client, tmp, TestingSessionLocal = create_test_app_and_client()
        
        try:
            # Create team and users using API
            from uuid import uuid4
            unique = str(uuid4())
            username1 = f"user1_{unique}"
            username2 = f"user2_{unique}"
            teamname = f"TestTeam_{unique}"
            
            # Register users
            user1_resp = client.post("/team/register", json={"username": username1})
            user2_resp = client.post("/team/register", json={"username": username2})
            user1_id = user1_resp.json()["id"]
            user2_id = user2_resp.json()["id"]
            
            # Create team
            team_resp = client.post("/team/create", json={"name": teamname})
            team_id = team_resp.json()["id"]
            
            # Join team
            client.post(f"/team/join?username={username1}&team_id={team_id}")
            client.post(f"/team/join?username={username2}&team_id={team_id}")
            
            # Create game session
            session_resp = client.post("/game/session", json={"team_id": team_id})
            session_id = session_resp.json()["id"]
            
            # Wait for session to become active
            import time
            time.sleep(6)
            
            # Set user2 points to 0 (eliminated) using direct DB access
            from app import models
            db = TestingSessionLocal()
            user2 = db.query(models.User).filter(models.User.id == user2_id).first()
            user2.points = 0
            db.commit()
            db.close()
            
            # Create spatial puzzle for user1
            puzzle_resp = client.post("/puzzle/create", json={
                "type": "spatial", 
                "game_session_id": session_id, 
                "user_id": user1_id
            })
            assert puzzle_resp.status_code == 200
            puzzle = puzzle_resp.json()
            
            # Submit correct answer
            answer_resp = client.post("/puzzle/answer", json={
                "puzzle_id": puzzle["id"], 
                "answer": "solved"
            })
            assert answer_resp.status_code == 200
            result = answer_resp.json()
            
            # Verify no points were awarded
            assert result["correct"] is True
            assert result["awarded_to_user_id"] is None
            assert result["points_awarded"] == 0
            
            # Verify user2's points didn't change
            points_resp = client.get(f"/puzzle/points/{team_id}")
            assert points_resp.status_code == 200
            points = points_resp.json()
            user2_points = next(p["points"] for p in points["players"] if p["user_id"] == user2_id)
            assert user2_points == 0
            
        finally:
            tmp.close()
    
    def test_spatial_puzzle_single_player_team(self):
        """Test spatial puzzle with single player team (no points awarded)"""
        client, tmp, _ = create_test_app_and_client()
        
        try:
            # Create team and user using API
            from uuid import uuid4
            unique = str(uuid4())
            username = f"user1_{unique}"
            teamname = f"TestTeam_{unique}"
            
            # Register user
            user_resp = client.post("/team/register", json={"username": username})
            user_id = user_resp.json()["id"]
            
            # Create team
            team_resp = client.post("/team/create", json={"name": teamname})
            team_id = team_resp.json()["id"]
            
            # Join team
            client.post(f"/team/join?username={username}&team_id={team_id}")
            
            # Create game session
            session_resp = client.post("/game/session", json={"team_id": team_id})
            session_id = session_resp.json()["id"]
            
            # Wait for session to become active
            import time
            time.sleep(6)
            
            # Create spatial puzzle
            puzzle_resp = client.post("/puzzle/create", json={
                "type": "spatial", 
                "game_session_id": session_id, 
                "user_id": user_id
            })
            assert puzzle_resp.status_code == 200
            puzzle = puzzle_resp.json()
            
            # Submit correct answer
            answer_resp = client.post("/puzzle/answer", json={
                "puzzle_id": puzzle["id"], 
                "answer": "solved"
            })
            assert answer_resp.status_code == 200
            result = answer_resp.json()
            
            # Verify no points were awarded (single player)
            assert result["correct"] is True
            assert result["awarded_to_user_id"] is None
            assert result["points_awarded"] == 0
            assert result["next_puzzle_id"] is not None
            
        finally:
            tmp.close() 