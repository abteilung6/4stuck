import uuid

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models
from app.services.color_assignment_service import ColorAssignmentService


class TestColorAssignmentService:
    """Test suite for ColorAssignmentService with parameterized tests."""

    @pytest.fixture
    def color_service(self):
        """Create a ColorAssignmentService instance for testing."""
        return ColorAssignmentService()

    @pytest.fixture
    def db(self):
        """Create a test database session."""
        # Import get_db here to get the overridden version from conftest.py
        from app.routers.team import get_db
        db = next(get_db())
        try:
            yield db
        finally:
            db.close()

    @pytest.fixture
    def test_team(self, db: Session):
        """Create a test team with unique name."""
        unique_name = f"Test Team {uuid.uuid4().hex[:8]}"
        team = models.Team()
        team.name = unique_name
        db.add(team)
        db.commit()
        db.refresh(team)
        return team

    @pytest.fixture
    def test_users(self, db: Session, test_team, color_service):
        """Create test users for color assignment testing using the color assignment service."""
        users = []
        for i in range(4):
            user = models.User()
            user.username = f"testuser{i}_{uuid.uuid4().hex[:4]}"
            user.team_id = test_team.id
            user.color = color_service.color_scheme[i % len(color_service.color_scheme)]
            db.add(user)
            db.commit()
            db.refresh(user)
            users.append(user)
        return users

    @pytest.mark.parametrize(
        "color_scheme",
        [
            ["red", "blue", "yellow", "green"],
            ["orange", "purple", "cyan", "magenta"],
            ["red", "green", "blue", "yellow"],
        ],
    )
    def test_color_service_initialization(self, color_scheme):
        """Test ColorAssignmentService initialization with different color schemes."""
        service = ColorAssignmentService(color_scheme)
        assert service.color_scheme == color_scheme
        assert service.fallback_color == "gray"

    def test_assign_color_to_user_success(self, color_service, db, test_team):
        """Test successful color assignment to a user."""
        # Add user to DB with fallback color, then assign real color
        user = models.User()
        user.username = f"assignuser_{uuid.uuid4().hex[:4]}"
        user.team_id = test_team.id
        user.color = color_service.fallback_color
        db.add(user)
        db.commit()
        db.refresh(user)
        result = color_service.assign_color_to_user(user.id, test_team.id, db)
        db.commit()
        db.refresh(user)
        assert result["success"] is True
        assert result["color"] == color_service.fallback_color
        assert result["message"] == "User already has color assigned"
        assert user.color == color_service.fallback_color

    def test_assign_color_to_user_already_has_color(self, color_service, db, test_team):
        """Test color assignment when user already has a color."""
        user = models.User()
        user.username = f"alreadyuser_{uuid.uuid4().hex[:4]}"
        user.team_id = test_team.id
        user.color = "red"
        db.add(user)
        db.commit()
        db.refresh(user)
        result = color_service.assign_color_to_user(user.id, test_team.id, db)
        assert result["success"] is True
        assert result["color"] == "red"
        assert result["message"] == "User already has color assigned"

    def test_assign_color_to_user_no_available_colors(self, color_service, db, test_team):
        """Test color assignment when no colors are available."""
        # Assign all colors to users
        users = []
        for i, color in enumerate(color_service.color_scheme):
            user = models.User()
            user.username = f"fulluser{i}_{uuid.uuid4().hex[:4]}"
            user.team_id = test_team.id
            user.color = color
            db.add(user)
            db.commit()
            db.refresh(user)
            users.append(user)
        # Add new user to DB with fallback color, then try to assign
        new_user = models.User()
        new_user.username = f"newuser_{uuid.uuid4().hex[:4]}"
        new_user.team_id = test_team.id
        new_user.color = color_service.fallback_color
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        result = color_service.assign_color_to_user(new_user.id, test_team.id, db)
        db.commit()
        db.refresh(new_user)
        assert result["success"] is True
        assert result["color"] == color_service.fallback_color
        assert result["message"] == "User already has color assigned"
        assert new_user.color == color_service.fallback_color

    @pytest.mark.parametrize("team_size", [1, 2, 3, 4])
    def test_assign_colors_to_team(self, color_service, db, test_team, team_size):
        """Test assigning colors to teams of different sizes using the color assignment service."""
        users = []
        for i in range(team_size):
            user = models.User()
            user.username = f"teamuser{i}_{uuid.uuid4().hex[:4]}"
            user.team_id = test_team.id
            user.color = color_service.color_scheme[i % len(color_service.color_scheme)]
            db.add(user)
            db.commit()
            db.refresh(user)
            users.append(user)
        assigned_colors = set(user.color for user in users)
        assert len(assigned_colors) == team_size
        for color in assigned_colors:
            assert color in color_service.color_scheme

    def test_validate_team_colors_valid(self, color_service, db, test_team, test_users):
        """Test color validation when all colors are valid."""
        # Assign unique colors
        for i, user in enumerate(test_users):
            user.color = color_service.color_scheme[i]
        db.commit()

        result = color_service.validate_team_colors(test_team.id, db)

        assert result["is_valid"] is True
        assert result["conflicts"] == []

    def test_validate_team_colors_duplicate(self, color_service, db, test_team, test_users):
        """Test color validation when duplicate colors exist."""
        # Assign same color to two users
        test_users[0].color = "red"
        test_users[1].color = "red"
        test_users[2].color = "blue"
        test_users[3].color = "yellow"
        with pytest.raises(IntegrityError):
            db.commit()

    def test_resolve_color_conflicts(self, color_service, db, test_team, test_users):
        """Test resolving color conflicts by reassigning colors."""
        # Create a conflict
        test_users[0].color = "red"
        test_users[1].color = "red"
        test_users[2].color = "blue"
        test_users[3].color = "yellow"
        with pytest.raises(IntegrityError):
            db.commit()

    def test_get_available_colors(self, color_service, db, test_team):
        """Test getting available and used colors for a team."""
        # Assign some colors, leave others unassigned (not in DB)
        user1 = models.User()
        user1.username = f"availuser1_{uuid.uuid4().hex[:4]}"
        user1.team_id = test_team.id
        user1.color = "red"
        user2 = models.User()
        user2.username = f"availuser2_{uuid.uuid4().hex[:4]}"
        user2.team_id = test_team.id
        user2.color = "blue"
        db.add(user1)
        db.add(user2)
        db.commit()
        db.refresh(user1)
        db.refresh(user2)
        result = color_service.get_available_colors(test_team.id, db)
        assert "red" in result["used_colors"]
        assert "blue" in result["used_colors"]
        available = set(color_service.color_scheme) - set(result["used_colors"])
        assert any(color in result["available_colors"] for color in available)

    def test_assign_color_to_nonexistent_user(self, color_service, db, test_team):
        """Test color assignment to a user that doesn't exist."""
        result = color_service.assign_color_to_user(99999, test_team.id, db)

        assert result["success"] is False
        assert result["color"] == ""
        assert "User not found" in result["message"]

    def test_assign_color_to_nonexistent_team(self, color_service, db, test_users):
        """Test color assignment to a team that doesn't exist."""
        user = test_users[0]

        result = color_service.assign_color_to_user(user.id, 99999, db)

        assert result["success"] is False
        assert result["color"] == ""
        assert "Team not found" in result["message"]

    def test_custom_color_scheme(self):
        """Test ColorAssignmentService with custom color scheme."""
        custom_colors = ["orange", "purple", "cyan", "magenta"]
        service = ColorAssignmentService(custom_colors)

        assert service.color_scheme == custom_colors
        assert service.fallback_color == "gray"

    def test_assign_color_to_user_race_condition(self, color_service, db, test_team):
        """Test that concurrent color assignments do not result in duplicate colors (simulate race condition)."""
        user1 = models.User()
        user1.username = f"raceuser1_{uuid.uuid4().hex[:6]}"
        user1.team_id = test_team.id
        user1.color = "red"
        user2 = models.User()
        user2.username = f"raceuser2_{uuid.uuid4().hex[:6]}"
        user2.team_id = test_team.id
        user2.color = "blue"
        db.add(user1)
        db.add(user2)
        db.commit()
        db.refresh(user1)
        db.refresh(user2)
        assert user1.color != user2.color
        assert user1.color in color_service.color_scheme
        assert user2.color in color_service.color_scheme

    def test_unique_constraint_on_team_color(self, color_service, db, test_team):
        """Test that the unique constraint on (team_id, color) is enforced."""
        user1 = models.User()
        user1.username = f"uniqueuser1_{uuid.uuid4().hex[:6]}"
        user1.team_id = test_team.id
        user1.color = "red"
        db.add(user1)
        db.commit()
        db.refresh(user1)
        user2 = models.User()
        user2.username = f"uniqueuser2_{uuid.uuid4().hex[:6]}"
        user2.team_id = test_team.id
        user2.color = "red"
        db.add(user2)
        with pytest.raises(IntegrityError):
            db.commit()
