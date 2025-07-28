"""
Auto-generated from 4stuck/schemas/api/v1/requests.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class CreateTeamRequest(BaseModel):
    """Create Team Request: Request to create a new team"""
    name: str = Field(description="Name for the new team")

    class Config:
        from_attributes = True

class JoinTeamRequest(BaseModel):
    """Join Team Request: Request to join an existing team"""
    username: str = Field(description="Username for the player joining the team")
    team_id: int = Field(description="ID of the team to join")

    class Config:
        from_attributes = True

class StartGameRequest(BaseModel):
    """Start Game Request: Request to start a game session"""
    team_id: int = Field(description="ID of the team starting the game")
    countdown_duration: Optional[int] = Field(default=None, description="Countdown duration in seconds before game starts")

    class Config:
        from_attributes = True

class SubmitAnswerRequest(BaseModel):
    """Submit Answer Request: Request to submit a puzzle answer"""
    puzzle_id: int = Field(description="ID of the puzzle being answered")
    answer: str = Field(description="Player's answer to the puzzle")
    user_id: Optional[int] = Field(default=None, description="ID of the user submitting the answer")

    class Config:
        from_attributes = True

class GetCurrentPuzzleRequest(BaseModel):
    """Get Current Puzzle Request: Request to get the current puzzle for a user"""
    user_id: int = Field(description="ID of the user to get puzzle for")

    class Config:
        from_attributes = True

class AssignColorRequest(BaseModel):
    """Assign Color Request: Request to assign a color to a user"""
    user_id: int = Field(description="ID of the user to assign color to")
    team_id: int = Field(description="ID of the team the user belongs to")
    preferred_color: Optional[Any] = Field(default=None, description="Preferred color (optional)")

    class Config:
        from_attributes = True

class UpdatePlayerReadyRequest(BaseModel):
    """Update Player Ready Request: Request to update player ready status"""
    user_id: int = Field(description="ID of the user to update")
    is_ready: bool = Field(description="Whether the player is ready to start")

    class Config:
        from_attributes = True

class GetGameStateRequest(BaseModel):
    """Get Game State Request: Request to get current game state"""
    session_id: int = Field(description="ID of the game session")

    class Config:
        from_attributes = True

class GetGameResultRequest(BaseModel):
    """Get Game Result Request: Request to get game result"""
    session_id: int = Field(description="ID of the completed game session")

    class Config:
        from_attributes = True

class RestartGameRequest(BaseModel):
    """Restart Game Request: Request to restart a game session"""
    team_id: int = Field(description="ID of the team to restart game for")

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    """User Create: Request to create a new user"""
    username: str = Field(description="Username for the new user")

    class Config:
        from_attributes = True

class TeamCreate(BaseModel):
    """Team Create: Request to create a new team"""
    name: str = Field(description="Name for the new team")

    class Config:
        from_attributes = True

class GameSessionCreate(BaseModel):
    """Game Session Create: Request to create a new game session"""
    team_id: int = Field(description="ID of the team for this game session")

    class Config:
        from_attributes = True

class GameSessionStateUpdate(BaseModel):
    """Game Session State Update: Request to update game session state"""
    status: Literal['lobby', 'countdown', 'active', 'finished'] = Field(description="New status for the game session")

    class Config:
        from_attributes = True

class PuzzleCreate(BaseModel):
    """Puzzle Create: Request to create a new puzzle"""
    type: Literal['memory', 'spatial', 'concentration', 'multitasking'] = Field(description="Type of puzzle to create")
    game_session_id: int = Field(description="ID of the game session")
    user_id: int = Field(description="ID of the user for this puzzle")

    class Config:
        from_attributes = True

class PuzzleAnswer(BaseModel):
    """Puzzle Answer: Answer submission for a puzzle"""
    puzzle_id: int = Field(description="ID of the puzzle being answered")
    answer: str = Field(description="The answer submitted by the user")
    user_id: int = Field(description="ID of the user submitting the answer")

    class Config:
        from_attributes = True
