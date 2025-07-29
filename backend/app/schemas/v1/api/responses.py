"""
Auto-generated from 
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class ErrorResponse(BaseModel):
    """Error Response: Standard error response"""
    detail: Union[str, List[Dict[str, Any]]]

    class Config:
        from_attributes = True

class TeamResponse(BaseModel):
    """Team Response: Team information response"""
    id: int = Field(description="Team ID")
    name: str = Field(description="Team name")
    users: List[Any] = Field(description="Team members")

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """User Response: User information response"""
    id: int = Field(description="User ID")
    username: str = Field(description="Username")
    team_id: Optional[int] = Field(default=None, description="Team ID (if assigned)")
    color: Optional[str] = Field(default=None, description="User color")

    class Config:
        from_attributes = True

class AvailableTeamResponse(BaseModel):
    """Available Team Response: Available team for joining"""
    id: int = Field(description="Team ID")
    name: str = Field(description="Team name")
    user_count: int = Field(description="Current number of users")
    max_users: int = Field(description="Maximum number of users")

    class Config:
        from_attributes = True

class GameSessionResponse(BaseModel):
    """Game Session Response: Game session information"""
    id: int = Field(description="Game session ID")
    team_id: int = Field(description="Team ID")
    status: Literal['lobby', 'countdown', 'active', 'finished'] = Field(description="Game session status")
    created_at: Optional[datetime] = Field(default=None, description="When the session was created")
    started_at: Optional[datetime] = Field(default=None, description="When the game started")
    ended_at: Optional[datetime] = Field(default=None, description="When the game ended")
    survival_time_seconds: Optional[int] = Field(default=None, description="How long the team survived in seconds")

    class Config:
        from_attributes = True

class PuzzleAnswerResponse(BaseModel):
    """Puzzle Answer Response: Response to puzzle answer submission"""
    correct: bool = Field(description="Whether the answer was correct")
    awarded_to_user_id: Optional[int] = Field(default=None, description="ID of user who received points")
    points_awarded: int = Field(description="Number of points awarded")
    next_puzzle_id: Optional[int] = Field(default=None, description="ID of next puzzle (if any)")
    next_puzzle: Optional[Any] = Field(default=None, description="Next puzzle data (if any)")

    class Config:
        from_attributes = True

class PuzzleStateResponse(BaseModel):
    """Puzzle State Response: Puzzle state for API responses"""
    id: int = Field(description="Puzzle ID")
    type: Literal['memory', 'spatial', 'concentration', 'multitasking'] = Field(description="Puzzle type")
    data: Any = Field(description="Puzzle-specific data")
    status: Literal['active', 'completed', 'failed'] = Field(description="Puzzle status")
    correct_answer: str = Field(description="Correct answer for the puzzle")

    class Config:
        from_attributes = True

class PlayerPoints(BaseModel):
    """Player Points: Player points response model"""
    user_id: int = Field(description="User ID")
    username: str = Field(description="Username")
    points: int = Field(description="Current points")

    class Config:
        from_attributes = True

class TeamPoints(BaseModel):
    """Team Points: Team points response model"""
    team_id: int = Field(description="Team ID")
    players: List[Any] = Field(description="Player points")

    class Config:
        from_attributes = True

class ColorAssignmentResponse(BaseModel):
    """Color Assignment Response: Response for color assignment operations"""
    success: bool = Field(description="Whether the operation was successful")
    message: str = Field(description="Response message")
    reassignments: Optional[Dict[str, Any]] = Field(default=None, description="Color reassignments made")
    conflicts: Optional[List[Dict[str, Any]]] = Field(default=None, description="Color conflicts found")

    class Config:
        from_attributes = True
