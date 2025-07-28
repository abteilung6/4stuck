"""
Auto-generated from 4stuck/schemas/core/v1/player.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class Player(BaseModel):
    """Player: A player in the game"""
    id: int = Field(description="Unique player identifier")
    username: str = Field(description="Player's display name")
    team_id: int = Field(description="ID of the team this player belongs to")
    color: Optional[Any] = Field(default=None, description="Color assigned to this player for identification")
    points: int = Field(description="Current points (0 = eliminated)")
    is_eliminated: Optional[bool] = Field(default=None, description="Whether the player has been eliminated from the game")
    is_ready: Optional[bool] = Field(default=None, description="Whether the player is ready to start the game")
    created_at: Optional[datetime] = Field(default=None, description="When the player was created")
    last_active: Optional[datetime] = Field(default=None, description="When the player was last active")

    class Config:
        from_attributes = True

class Team(BaseModel):
    """Team: A team of players"""
    id: int = Field(description="Unique team identifier")
    name: str = Field(description="Team name")
    members: Optional[List[Any]] = Field(default=None, description="Players in this team")
    player_count: Optional[int] = Field(default=None, description="Number of players in the team")
    created_at: Optional[datetime] = Field(default=None, description="When the team was created")

    class Config:
        from_attributes = True

class TeamStatus(BaseModel):
    """Team Status: Team availability status"""

    class Config:
        from_attributes = True

class AvailableTeam(BaseModel):
    """Available Team: Team that can accept new players"""
    id: int = Field(description="Team identifier")
    name: str = Field(description="Team name")
    members: List[Any] = Field(description="Current team members")
    player_count: int = Field(description="Number of players in the team")
    max_players: Optional[int] = Field(default=None, description="Maximum number of players allowed in the team")
    status: Any = Field(description="Current team status")
    game_session_id: Optional[int] = Field(default=None, description="ID of active game session (if any)")
    game_status: Optional[Literal['lobby', 'countdown', 'active', 'finished']] = Field(default=None, description="Status of active game session (if any)")

    class Config:
        from_attributes = True
