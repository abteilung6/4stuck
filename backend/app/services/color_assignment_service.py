import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

from .. import models


logger = logging.getLogger(__name__)


class ColorAssignmentService:
    """Centralized color management with validation and testing support"""

    def __init__(self, color_scheme: Optional[list[str]] = None):
        self.color_scheme = color_scheme or ["red", "blue", "yellow", "green"]
        self.fallback_color = "gray"

    def assign_color_to_user(self, user_id: int, team_id: int, db: Session) -> dict[str, Any]:
        """
        Assign unique color to user within team, with retry logic for race conditions.
        """
        try:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if not user:
                return {"success": False, "color": "", "message": "User not found"}
            team = db.query(models.Team).filter(models.Team.id == team_id).first()
            if not team:
                return {"success": False, "color": "", "message": "Team not found"}
            if user.color:
                return {"success": True, "color": user.color, "message": "User already has color assigned"}
            # Retry logic for race conditions
            for attempt in range(len(self.color_scheme)):
                team_members = db.query(models.User).filter(models.User.team_id == team_id).all()
                used_colors = [member.color for member in team_members if member.color]
                available_color = self._find_available_color(used_colors)
                if available_color and available_color != self.fallback_color:
                    user.color = available_color
                    try:
                        db.commit()
                    except Exception:
                        db.rollback()
                        # Likely a unique constraint violation, try next color
                        continue
                    # Re-fetch to check for uniqueness
                    conflict = (
                        db.query(models.User)
                        .filter(
                            models.User.team_id == team_id,
                            models.User.color == available_color,
                            models.User.id != user.id,
                        )
                        .first()
                    )
                    if conflict:
                        # Conflict detected, try next color
                        user.color = None
                        db.commit()
                        continue
                    logger.info(
                        f"Assigned color {available_color} to user {user_id} in team {team_id} (attempt {attempt + 1})",
                    )
                    return {"success": True, "color": available_color, "message": "Color assigned successfully"}
            logger.warning(f"No available colors for user {user_id} in team {team_id} after retries")
            return {
                "success": False,
                "color": self.fallback_color,
                "message": "No available colors in team after retries",
            }
        except Exception as e:
            logger.error(f"Error assigning color to user {user_id}: {e}")
            return {"success": False, "color": self.fallback_color, "message": f"Error assigning color: {str(e)}"}

    def validate_team_colors(self, team_id: int, db: Session) -> dict[str, Any]:
        """
        Validate color uniqueness within team.

        Args:
            team_id: ID of the team to validate
            db: Database session

        Returns:
            Dict[str, Any]: {"is_valid": bool, "conflicts": List[Dict]}
        """
        try:
            team_members = db.query(models.User).filter(models.User.team_id == team_id).all()

            color_counts: dict[str, list[int]] = {}
            conflicts = []

            # Count users per color
            for member in team_members:
                if member.color and member.id is not None:
                    if member.color not in color_counts:
                        color_counts[member.color] = []
                    color_counts[member.color].append(member.id)

            # Check for conflicts
            for color, user_ids in color_counts.items():
                if len(user_ids) > 1:
                    conflicts.append({"color": color, "user_ids": user_ids, "count": len(user_ids)})

            is_valid = len(conflicts) == 0
            return {"is_valid": is_valid, "conflicts": conflicts}

        except Exception as e:
            logger.error(f"Error validating team colors for team {team_id}: {e}")
            return {"is_valid": False, "conflicts": [{"error": str(e)}]}

    def get_available_colors(self, team_id: int, db: Session) -> dict[str, list[str]]:
        """
        Get available and used colors for team.

        Args:
            team_id: ID of the team
            db: Database session

        Returns:
            Dict[str, List[str]]: {"available_colors": List[str], "used_colors": List[str]}
        """
        try:
            team_members = db.query(models.User).filter(models.User.team_id == team_id).all()

            used_colors = [member.color for member in team_members if member.color]
            available_colors = [color for color in self.color_scheme if color not in used_colors]

            return {"available_colors": available_colors, "used_colors": used_colors}

        except Exception as e:
            logger.error(f"Error getting available colors for team {team_id}: {e}")
            return {"available_colors": [], "used_colors": []}

    def resolve_color_conflicts(self, team_id: int, db: Session) -> dict[str, Any]:
        """
        Resolve color conflicts by reassigning colors.

        Args:
            team_id: ID of the team
            db: Database session

        Returns:
            Dict[str, Any]: {"success": bool, "reassignments": Dict[str, str], "message": str}
        """
        try:
            team_members = db.query(models.User).filter(models.User.team_id == team_id).order_by(models.User.id).all()

            reassignments: dict[str, str] = {}
            used_colors: list[str] = []

            # Reassign colors to all team members
            for member in team_members:
                available_color = self._find_available_color(used_colors)
                if available_color:
                    if member.color != available_color:
                        reassignments[str(member.id)] = available_color
                    member.color = available_color
                    used_colors.append(available_color)
                else:
                    # Fallback if no colors available
                    if member.color != self.fallback_color:
                        reassignments[str(member.id)] = self.fallback_color
                    member.color = self.fallback_color

            db.commit()

            return {
                "success": True,
                "reassignments": reassignments,
                "message": f"Resolved conflicts for {len(reassignments)} users",
            }

        except Exception as e:
            logger.error(f"Error resolving color conflicts for team {team_id}: {e}")
            return {"success": False, "reassignments": {}, "message": f"Error resolving conflicts: {str(e)}"}

    def _find_available_color(self, used_colors: list[str]) -> str:
        """
        Find first available color from the color scheme.

        Args:
            used_colors: List of already used colors

        Returns:
            str: Available color or fallback color
        """
        for color in self.color_scheme:
            if color not in used_colors:
                return color
        return self.fallback_color

    def get_color_scheme(self) -> list[str]:
        """Get the current color scheme."""
        return self.color_scheme.copy()

    def set_color_scheme(self, color_scheme: list[str]) -> None:
        """Set a new color scheme."""
        self.color_scheme = color_scheme.copy()


# Global instance for dependency injection
color_assignment_service = ColorAssignmentService()
