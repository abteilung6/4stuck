from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.routers.game import (
    get_db as get_db_game,
    router as game_router,
)
from app.routers.puzzle import (
    get_db as get_db_puzzle,
    router as puzzle_router,
)
from app.routers.team import (
    get_db as get_db_team,
    router as team_router,
)


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


def create_team_with_users(client, team_name: str, user_count: int):
    """Helper to create a team with specified number of users"""
    unique = str(uuid4())
    team_resp = client.post("/team/create", json={"name": f"{team_name}_{unique}"})
    team_id = team_resp.json()["id"]

    users = []
    for i in range(user_count):
        username = f"user{i}_{unique}"
        user_resp = client.post("/team/register", json={"username": username})
        user_id = user_resp.json()["id"]
        join_resp = client.post(f"/team/join?username={username}&team_id={team_id}")
        users.append(join_resp.json())

    return team_id, users


def test_get_available_teams_empty():
    """Test getting available teams when no teams exist"""
    client, tmp, _ = create_test_app_and_client()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    assert resp.json() == []

    tmp.close()


def test_get_available_teams_single_available():
    """Test getting available teams with one available team"""
    client, tmp, _ = create_test_app_and_client()

    # Create a team with 2 users (available)
    team_id, users = create_team_with_users(client, "TestTeam", 2)

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    assert len(teams) == 1
    team = teams[0]
    assert team["id"] == team_id
    assert team["status"] == "available"
    assert team["player_count"] == 2
    assert team["max_players"] == 4
    assert team["game_session_id"] is None
    assert team["game_status"] is None
    assert len(team["members"]) == 2

    tmp.close()


def test_get_available_teams_full_team_excluded():
    """Test that full teams (4 players) are excluded from available teams"""
    client, tmp, _ = create_test_app_and_client()

    # Create a full team (4 users)
    team_id, users = create_team_with_users(client, "FullTeam", 4)

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should not include the full team
    assert len(teams) == 0

    tmp.close()


def test_get_available_teams_in_game_excluded():
    """Test that teams in active games are excluded from available teams"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create a team with 2 users
    team_id, users = create_team_with_users(client, "GameTeam", 2)

    # Create an active game session for this team
    from app.models import GameSession

    db = TestingSessionLocal()
    game_session = GameSession()
    game_session.team_id = team_id
    game_session.status = "active"
    game_session.started_at = datetime.now(timezone.utc)
    db.add(game_session)
    db.commit()
    db.close()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should not include the team in active game
    assert len(teams) == 0

    tmp.close()


def test_get_available_teams_mixed_scenarios():
    """Test available teams with mixed scenarios"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create different types of teams
    available_team_id, _ = create_team_with_users(client, "AvailableTeam", 2)
    full_team_id, _ = create_team_with_users(client, "FullTeam", 4)
    game_team_id, _ = create_team_with_users(client, "GameTeam", 1)

    # Create an active game session for the game team
    from app.models import GameSession

    db = TestingSessionLocal()
    game_session = GameSession()
    game_session.team_id = game_team_id
    game_session.status = "active"
    game_session.started_at = datetime.now(timezone.utc)
    db.add(game_session)
    db.commit()
    db.close()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should only include the available team
    assert len(teams) == 1
    assert teams[0]["id"] == available_team_id
    assert teams[0]["status"] == "available"

    tmp.close()


def test_get_available_teams_lobby_status_excluded():
    """Test that teams in lobby status are excluded (they're in a game session)"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create a team with 2 users
    team_id, users = create_team_with_users(client, "LobbyTeam", 2)

    # Create a lobby game session for this team
    from app.models import GameSession

    db = TestingSessionLocal()
    game_session = GameSession()
    game_session.team_id = team_id
    game_session.status = "lobby"
    db.add(game_session)
    db.commit()
    db.close()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should not include the team in lobby
    assert len(teams) == 0

    tmp.close()


def test_get_available_teams_countdown_status_excluded():
    """Test that teams in countdown status are excluded"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create a team with 2 users
    team_id, users = create_team_with_users(client, "CountdownTeam", 2)

    # Create a countdown game session for this team
    from app.models import GameSession

    db = TestingSessionLocal()
    game_session = GameSession()
    game_session.team_id = team_id
    game_session.status = "countdown"
    db.add(game_session)
    db.commit()
    db.close()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should not include the team in countdown
    assert len(teams) == 0

    tmp.close()


def test_get_available_teams_finished_game_included():
    """Test that teams with finished games are included as available ONLY if they have fewer than 4 players"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create a team with 2 users (should be available even with finished game)
    team_id, users = create_team_with_users(client, "FinishedTeam", 2)

    # Create a finished game session for this team
    from app.models import GameSession

    db = TestingSessionLocal()
    game_session = GameSession()
    game_session.team_id = team_id
    game_session.status = "finished"
    game_session.started_at = datetime.now(timezone.utc)
    game_session.ended_at = datetime.now(timezone.utc)
    db.add(game_session)
    db.commit()
    db.close()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should include the team with finished game (only 2 players)
    assert len(teams) == 1
    assert teams[0]["id"] == team_id
    assert teams[0]["status"] == "available"

    tmp.close()


def test_get_available_teams_finished_game_full_team_excluded():
    """Test that teams with finished games are excluded if they have 4 players"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create a team with 4 users (should NOT be available even with finished game)
    team_id, users = create_team_with_users(client, "FinishedFullTeam", 4)

    # Create a finished game session for this team
    from app.models import GameSession

    db = TestingSessionLocal()
    game_session = GameSession()
    game_session.team_id = team_id
    game_session.status = "finished"
    game_session.started_at = datetime.now(timezone.utc)
    game_session.ended_at = datetime.now(timezone.utc)
    db.add(game_session)
    db.commit()
    db.close()

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    # Should NOT include the team with finished game (4 players = full)
    assert len(teams) == 0

    tmp.close()


def test_list_teams_simple():
    """Test the original /team/ endpoint returns all teams"""
    client, tmp, TestingSessionLocal = create_test_app_and_client()

    # Create different types of teams
    available_team_id, _ = create_team_with_users(client, "AvailableTeam", 2)
    full_team_id, _ = create_team_with_users(client, "FullTeam", 4)

    # Test that it shows all teams (for admin/debug purposes)
    resp = client.get("/team/")
    assert resp.status_code == 200
    teams = resp.json()
    assert len(teams) == 2

    # Verify both teams are included regardless of availability
    team_ids = [team["id"] for team in teams]
    assert available_team_id in team_ids
    assert full_team_id in team_ids

    tmp.close()


def test_available_teams_response_structure():
    """Test that available teams response has the correct structure"""
    client, tmp, _ = create_test_app_and_client()

    # Create an available team
    team_id, users = create_team_with_users(client, "TestTeam", 2)

    resp = client.get("/team/available")
    assert resp.status_code == 200
    teams = resp.json()

    assert len(teams) == 1
    team = teams[0]

    # Check required fields
    required_fields = [
        "id",
        "name",
        "members",
        "player_count",
        "max_players",
        "status",
        "game_session_id",
        "game_status",
    ]
    for field in required_fields:
        assert field in team

    # Check field types and values
    assert isinstance(team["id"], int)
    assert isinstance(team["name"], str)
    assert isinstance(team["members"], list)
    assert isinstance(team["player_count"], int)
    assert team["max_players"] == 4
    assert team["status"] == "available"
    assert team["game_session_id"] is None
    assert team["game_status"] is None

    tmp.close()
