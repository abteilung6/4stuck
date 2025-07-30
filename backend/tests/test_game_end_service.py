from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base, GameSession, Team, User
from app.services.game_end_service import GameEndService


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
    app.dependency_overrides = {}
    client = TestClient(app)
    return client, tmp, TestingSessionLocal


def create_team_and_users(TestingSessionLocal, team_name="TestTeam", user_count=4):
    """Helper to create a team with users for testing."""
    db = TestingSessionLocal()
    try:
        # Create team
        team = Team()
        team.name = team_name
        db.add(team)
        db.commit()
        db.refresh(team)

        # Create users
        users = []
        for i in range(user_count):
            user = User()
            user.username = f"{team_name.lower()}_user{i + 1}"
            user.team_id = team.id
            user.points = 15
            db.add(user)
            users.append(user)

        db.commit()
        for user in users:
            db.refresh(user)

        # Return the IDs instead of the objects to avoid session issues
        return team.id, [user.id for user in users]
    finally:
        db.close()


class TestGameEndService:
    """Test suite for the GameEndService class."""

    def setup_method(self):
        """Set up a fresh game end service for each test."""
        self.service = GameEndService()

    def test_should_end_game_all_players_eliminated(self):
        """Test that game should end when all players have 0 points."""
        client, tmp, TestingSessionLocal = create_test_app_and_client()

        try:
            team_id, user_ids = create_team_and_users(TestingSessionLocal)

            # Create a game session
            db = TestingSessionLocal()
            session = GameSession()
            session.team_id = team_id
            session.status = "active"
            db.add(session)
            db.commit()
            db.refresh(session)

            # Set all users to 0 points
            for user_id in user_ids:
                user = db.query(User).filter(User.id == user_id).first()
                user.points = 0
            db.commit()

            # Check if game should end
            should_end = self.service._should_end_game(session, db)
            assert should_end == True

            db.close()
        finally:
            tmp.close()

    def test_should_not_end_game_players_still_alive(self):
        """Test that game should not end when some players still have points."""
        client, tmp, TestingSessionLocal = create_test_app_and_client()

        try:
            team_id, user_ids = create_team_and_users(TestingSessionLocal)

            # Create a game session
            db = TestingSessionLocal()
            session = GameSession()
            session.team_id = team_id
            session.status = "active"
            db.add(session)
            db.commit()
            db.refresh(session)

            # Set some users to 0 points, but keep one alive
            for i, user_id in enumerate(user_ids):
                user = db.query(User).filter(User.id == user_id).first()
                if i < 3:
                    user.points = 0
                else:
                    user.points = 5  # Still alive
            db.commit()

            # Check if game should end
            should_end = self.service._should_end_game(session, db)
            assert should_end == False

            db.close()
        finally:
            tmp.close()

    def test_should_end_game_no_users(self):
        """Test that game should end when there are no users in the team."""
        client, tmp, TestingSessionLocal = create_test_app_and_client()

        try:
            team_id, user_ids = create_team_and_users(TestingSessionLocal)

            # Create a game session
            db = TestingSessionLocal()
            session = GameSession()
            session.team_id = team_id
            session.status = "active"
            db.add(session)
            db.commit()
            db.refresh(session)

            # Remove all users from team
            for user_id in user_ids:
                user = db.query(User).filter(User.id == user_id).first()
                user.team_id = None
            db.commit()

            # Check if game should end
            should_end = self.service._should_end_game(session, db)
            assert should_end == True

            db.close()
        finally:
            tmp.close()

    def test_end_game_session_transition(self):
        """Test that ending a game session properly transitions to finished state."""
        client, tmp, TestingSessionLocal = create_test_app_and_client()

        try:
            team_id, user_ids = create_team_and_users(TestingSessionLocal)

            # Create a game session with started_at timestamp
            db = TestingSessionLocal()
            started_at = datetime.now(timezone.utc) - timedelta(minutes=5)  # 5 minutes ago
            session = GameSession()
            session.team_id = team_id
            session.status = "active"
            session.started_at = started_at
            db.add(session)
            db.commit()
            db.refresh(session)

            # End the game session
            self.service._end_game_session(session, db)
            db.commit()
            db.refresh(session)

            # Verify the session is now finished
            assert session.status == "finished"
            assert session.ended_at is not None
            assert session.survival_time_seconds is not None
            assert session.survival_time_seconds > 0

            db.close()
        finally:
            tmp.close()

    def test_check_and_handle_game_end_multiple_sessions(self):
        """Test that the service can handle multiple active sessions."""
        client, tmp, TestingSessionLocal = create_test_app_and_client()

        try:
            # Create two teams with users
            team1_id, users1_ids = create_team_and_users(TestingSessionLocal, "Team1", 2)
            team2_id, users2_ids = create_team_and_users(TestingSessionLocal, "Team2", 2)

            db = TestingSessionLocal()

            # Create two active game sessions
            session1 = GameSession()
            session1.team_id = team1_id
            session1.status = "active"
            session2 = GameSession()
            session2.team_id = team2_id
            session2.status = "active"
            db.add(session1)
            db.add(session2)
            db.commit()
            db.refresh(session1)
            db.refresh(session2)

            # Set all users in team1 to 0 points (should end)
            for user_id in users1_ids:
                user = db.query(User).filter(User.id == user_id).first()
                user.points = 0

            # Keep team2 users alive
            user1 = db.query(User).filter(User.id == users2_ids[0]).first()
            user2 = db.query(User).filter(User.id == users2_ids[1]).first()
            user1.points = 5
            user2.points = 3

            db.commit()

            # Check for game end
            ended_sessions = self.service.check_and_handle_game_end(db)

            # Verify only session1 ended
            assert len(ended_sessions) == 1
            assert session1.id in ended_sessions

            # Verify session1 is finished
            db.refresh(session1)
            assert session1.status == "finished"

            # Verify session2 is still active
            db.refresh(session2)
            assert session2.status == "active"

            db.close()
        finally:
            tmp.close()


if __name__ == "__main__":
    pytest.main([__file__])
