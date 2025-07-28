from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

Base = declarative_base()

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", back_populates="team")
    game_sessions = relationship("GameSession", back_populates="team")

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint('team_id', 'color', name='uq_team_color'),
    )
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team = relationship("Team", back_populates="users")
    points = Column(Integer, default=15)  # Starting points, configurable
    color = Column(String, nullable=True)  # Player color: red, blue, yellow, green
    puzzles = relationship("Puzzle", back_populates="user")

class GameSession(Base):
    __tablename__ = "game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    status = Column(String, default="lobby")  # lobby, countdown, active, finished
    started_at = Column(DateTime(timezone=True), nullable=True)  # When game actually started (active state)
    ended_at = Column(DateTime(timezone=True), nullable=True)    # When game ended (all players eliminated)
    survival_time_seconds = Column(Integer, nullable=True)  # Total survival time
    team = relationship("Team", back_populates="game_sessions")
    puzzles = relationship("Puzzle", back_populates="game_session")

class Puzzle(Base):
    __tablename__ = "puzzles"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # e.g., memory, spatial, etc.
    data = Column(JSON, nullable=False)    # Puzzle data (e.g., color mapping)
    correct_answer = Column(String, nullable=False)
    status = Column(String, default="active")  # active, solved, failed
    game_session_id = Column(Integer, ForeignKey("game_sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    solved_at = Column(DateTime, nullable=True)
    game_session = relationship("GameSession", back_populates="puzzles")
    user = relationship("User", back_populates="puzzles") 