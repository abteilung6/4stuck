from datetime import datetime, timezone
from typing import List

from sqlalchemy.orm import Session

from .. import models
from ..utils.websocket_broadcast import broadcast_state


class GameEndService:
    """Service to handle game end detection and state transitions."""

    def __init__(self):
        pass

    def check_and_handle_game_end(self, db: Session) -> List[int]:
        """
        Check for game end conditions and handle transitions to finished state.

        Args:
            db: Database session

        Returns:
            List[int]: List of session IDs that were updated
        """
        updated_sessions = []

        try:
            # Get all active game sessions
            active_sessions = db.query(models.GameSession).filter(models.GameSession.status == "active").all()

            for session in active_sessions:
                if self._should_end_game(session, db):
                    self._end_game_session(session, db)
                    updated_sessions.append(session.id)

            # Commit all changes
            if updated_sessions:
                db.commit()

        except Exception as e:
            print(f"Error in game end detection: {e}")

        return updated_sessions

    def _should_end_game(self, session: models.GameSession, db: Session) -> bool:
        """
        Check if a game session should end (all players eliminated).

        Args:
            session: Game session to check
            db: Database session

        Returns:
            bool: True if game should end, False otherwise
        """
        try:
            # Get all users in the team
            team_users = db.query(models.User).filter(models.User.team_id == session.team_id).all()

            if not team_users:
                # No users in team, end the game
                return True

            # Check if all players are eliminated (points <= 0)
            all_eliminated = all(user.points <= 0 for user in team_users)

            return all_eliminated

        except Exception as e:
            print(f"Error checking game end condition for session {session.id}: {e}")
            return False

    def _end_game_session(self, session: models.GameSession, db: Session) -> None:
        """
        End a game session by transitioning to finished state.

        Args:
            session: Game session to end
            db: Database session
        """
        try:
            # Transition to finished state
            session.status = "finished"
            session.ended_at = datetime.now(timezone.utc)

            # Calculate survival time
            if session.started_at:
                # Handle both timezone-aware and timezone-naive datetimes
                started_at = session.started_at
                ended_at = session.ended_at

                # If started_at is timezone-naive, assume UTC
                if started_at.tzinfo is None:
                    started_at = started_at.replace(tzinfo=timezone.utc)

                survival_time = (ended_at - started_at).total_seconds()
                session.survival_time_seconds = int(survival_time)

            print(f"Game session {session.id} ended. Survival time: {session.survival_time_seconds} seconds")

        except Exception as e:
            print(f"Error ending game session {session.id}: {e}")

    async def broadcast_game_end(self, session_id: int, db: Session) -> None:
        """
        Broadcast game end state to all connected clients.

        Args:
            session_id: Game session ID
            db: Database session
        """
        try:
            await broadcast_state(session_id, db)
            print(f"Game end broadcast sent for session {session_id}")
        except Exception as e:
            print(f"Failed to broadcast game end for session {session_id}: {e}")


# Global instance of the game end service
game_end_service = GameEndService()
