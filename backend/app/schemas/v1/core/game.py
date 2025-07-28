"""
Auto-generated from 4stuck/schemas/core/v1/game.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class GameStatus(BaseModel):
    """Game Status: Available game statuses"""

    class Config:
        from_attributes = True

class GameSession(BaseModel):
    """Game Session: A game session for a team"""
    id: int = Field(description="Unique game session identifier")
    team_id: int = Field(description="ID of the team playing this session")
    status: Any = Field(description="Current status of the game session")
    created_at: datetime = Field(description="When the game session was created")
    started_at: Optional[datetime] = Field(default=None, description="When the game started (active status)")
    ended_at: Optional[datetime] = Field(default=None, description="When the game ended (finished status)")
    survival_time_seconds: Optional[int] = Field(default=None, description="How long the team survived in seconds")
    countdown_duration: Optional[int] = Field(default=None, description="Countdown duration in seconds before game starts")

    class Config:
        from_attributes = True

class GameState(BaseModel):
    """Game State: Complete current state of a game"""
    session: Any = Field(description="Current game session information")
    players: List[Any] = Field(description="All players in the game with current state")
    puzzles: Optional[List[Any]] = Field(default=None, description="Current puzzles for all players")
    timestamp: datetime = Field(description="When this game state was captured")
    countdown_remaining: Optional[int] = Field(default=None, description="Seconds remaining in countdown (if in countdown status)")
    next_point_decay: Optional[datetime] = Field(default=None, description="When the next point decay will occur")

    class Config:
        from_attributes = True

class GameConfig(BaseModel):
    """Game Configuration: Configuration parameters for the game"""
    starting_points: int = Field(description="Starting points for each player")
    point_decay_interval: int = Field(description="Seconds between point decay events")
    points_lost_per_decay: int = Field(description="Points lost per decay event")
    points_awarded_for_solving: int = Field(description="Points awarded to next player when puzzle is solved")
    max_team_size: Optional[int] = Field(default=None, description="Maximum number of players per team")
    countdown_duration: Optional[int] = Field(default=None, description="Countdown duration in seconds before game starts")

    class Config:
        from_attributes = True

class GameResult(BaseModel):
    """Game Result: Final result of a completed game session"""
    session: Any = Field(description="The completed game session")
    survival_time_seconds: int = Field(description="Total survival time in seconds")
    final_players: List[Any] = Field(description="Final state of all players")
    puzzles_solved_per_player: Optional[Dict[str, Any]] = Field(default=None, description="Number of puzzles solved by each player")
    points_given_per_player: Optional[Dict[str, Any]] = Field(default=None, description="Total points given by each player to teammates")
    points_received_per_player: Optional[Dict[str, Any]] = Field(default=None, description="Total points received by each player from teammates")

    class Config:
        from_attributes = True
