"""
Auto-generated from 4stuck/schemas/api/v1/responses.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class ApiResponse(BaseModel):
    """API Response: Base structure for all API responses"""
    success: bool = Field(description="Whether the request was successful")
    data: Optional[Any] = Field(default=None, description="Response data (if successful)")
    error: Optional[str] = Field(default=None, description="Error message (if not successful)")
    message: Optional[str] = Field(default=None, description="Additional message or description")

    class Config:
        from_attributes = True

class TeamResponse(BaseModel):
    """Team Response: Response containing team information"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class AvailableTeamsResponse(BaseModel):
    """Available Teams Response: Response containing list of available teams"""
    success: bool
    data: Optional[List[Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class PlayerResponse(BaseModel):
    """Player Response: Response containing player information"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class GameSessionResponse(BaseModel):
    """Game Session Response: Response containing game session information"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class GameStateResponse(BaseModel):
    """Game State Response: Response containing complete game state"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class GameResultResponse(BaseModel):
    """Game Result Response: Response containing game result information"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class PuzzleResponse(BaseModel):
    """Puzzle Response: Response containing puzzle information"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class PuzzleResultResponse(BaseModel):
    """Puzzle Result Response: Response containing puzzle submission result"""
    success: bool
    data: Optional[Any] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class ColorAssignmentResponse(BaseModel):
    """Color Assignment Response: Response containing color assignment result"""
    success: bool
    data: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class CountdownResponse(BaseModel):
    """Countdown Response: Response containing countdown information"""
    success: bool
    data: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    """Error Response: Standard error response"""
    success: Any
    error: str = Field(description="Error message")
    message: Optional[str] = Field(default=None, description="Additional error details")
    code: Optional[str] = Field(default=None, description="Error code")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Additional error details")

    class Config:
        from_attributes = True

class SuccessResponse(BaseModel):
    """Success Response: Standard success response"""
    success: Any
    message: Optional[str] = Field(default=None, description="Success message")
    data: Optional[Any] = Field(default=None, description="Response data")

    class Config:
        from_attributes = True

class HealthCheckResponse(BaseModel):
    """Health Check Response: API health check response"""
    success: Any
    status: Literal['healthy', 'degraded', 'unhealthy']
    timestamp: datetime
    version: Optional[str] = Field(default=None, description="API version")
    uptime: Optional[float] = Field(default=None, description="Server uptime in seconds")

    class Config:
        from_attributes = True

class TeamColorValidationResponse(BaseModel):
    """Team Color Validation Response: Response for team color validation"""
    success: bool
    data: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class ColorConflictResolutionResponse(BaseModel):
    """Color Conflict Resolution Response: Response for color conflict resolution"""
    success: bool
    data: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class AvailableColorsResponse(BaseModel):
    """Available Colors Response: Response for available colors"""
    success: bool
    data: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    """User Out: User response model"""
    id: int = Field(description="User ID")
    username: str = Field(description="Username")
    team_id: Optional[int] = Field(default=None, description="Team ID")
    points: int = Field(description="Current points")
    color: Optional[str] = Field(default=None, description="Assigned color")

    class Config:
        from_attributes = True

class TeamOut(BaseModel):
    """Team Out: Team response model"""
    id: int = Field(description="Team ID")
    name: str = Field(description="Team name")

    class Config:
        from_attributes = True

class TeamWithMembersOut(BaseModel):
    """Team With Members Out: Team with members response model"""
    id: int = Field(description="Team ID")
    name: str = Field(description="Team name")
    members: List[Any] = Field(description="Team members")

    class Config:
        from_attributes = True

class GameSessionOut(BaseModel):
    """Game Session Out: Game session response model"""
    id: int = Field(description="Game session ID")
    team_id: int = Field(description="Team ID")
    status: Literal['lobby', 'countdown', 'active', 'finished'] = Field(description="Game session status")
    started_at: Optional[datetime] = Field(default=None, description="When the game started")
    ended_at: Optional[datetime] = Field(default=None, description="When the game ended")
    survival_time_seconds: Optional[int] = Field(default=None, description="How long the team survived in seconds")

    class Config:
        from_attributes = True

class PuzzleState(BaseModel):
    """Puzzle State: Puzzle state response model"""
    id: int = Field(description="Puzzle ID")
    type: Literal['memory', 'spatial', 'concentration', 'multitasking'] = Field(description="Puzzle type")
    data: Any = Field(description="Puzzle-specific data")
    status: Literal['active', 'completed', 'failed'] = Field(description="Puzzle status")
    correct_answer: str = Field(description="Correct answer for the puzzle")

    class Config:
        from_attributes = True

class PuzzleResult(BaseModel):
    """Puzzle Result: Puzzle result response model"""
    correct: bool = Field(description="Whether the answer was correct")
    awarded_to_user_id: Optional[int] = Field(default=None, description="ID of user who received points")
    points_awarded: int = Field(description="Number of points awarded")
    next_puzzle_id: Optional[int] = Field(default=None, description="ID of next puzzle (if any)")
    next_puzzle: Optional[Any] = Field(default=None, description="Next puzzle data (if any)")

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
    players: List[Any] = Field(description="List of players with their points")

    class Config:
        from_attributes = True
