from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, declarative_base, mapped_column, relationship


Base = declarative_base()


class Team(Base):
    __tablename__ = "teams"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    users: Mapped[list["User"]] = relationship("User", back_populates="team")
    game_sessions: Mapped[list["GameSession"]] = relationship("GameSession", back_populates="team")


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("team_id", "color", name="uq_team_color"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    team_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("teams.id"), nullable=True)
    team: Mapped["Team"] = relationship("Team", back_populates="users")
    points: Mapped[int] = mapped_column(Integer, default=15)  # Starting points, configurable
    color: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Player color: red, blue, yellow, green
    puzzles: Mapped[list["Puzzle"]] = relationship("Puzzle", back_populates="user")


class GameSession(Base):
    __tablename__ = "game_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    team_id: Mapped[int] = mapped_column(Integer, ForeignKey("teams.id"))
    status: Mapped[str] = mapped_column(String, default="lobby")  # lobby, countdown, active, finished
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )  # When game actually started (active state)
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )  # When game ended (all players eliminated)
    survival_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Total survival time
    team: Mapped["Team"] = relationship("Team", back_populates="game_sessions")
    puzzles: Mapped[list["Puzzle"]] = relationship("Puzzle", back_populates="game_session")


class Puzzle(Base):
    __tablename__ = "puzzles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String, nullable=False)  # e.g., memory, spatial, etc.
    data: Mapped[dict] = mapped_column(JSON, nullable=False)  # Puzzle data (e.g., color mapping)
    correct_answer: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="active")  # active, solved, failed
    game_session_id: Mapped[int] = mapped_column(Integer, ForeignKey("game_sessions.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    solved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    game_session: Mapped["GameSession"] = relationship("GameSession", back_populates="puzzles")
    user: Mapped["User"] = relationship("User", back_populates="puzzles")
