"""
Auto-generated from 4stuck/schemas/api/v1/responses.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class ApiResponse(BaseModel):
    """API Response: Base structure for all API responses"""
    success: bool = Field(description="Whether the request was successful")
    data: Optional[Any] = Field(description="Response data (if successful)")
    error: Optional[str] = Field(description="Error message (if not successful)")
    message: Optional[str] = Field(description="Additional message or description")

    class Config:
        from_attributes = True

class TeamResponse(BaseModel):
    """Team Response: Response containing team information"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class AvailableTeamsResponse(BaseModel):
    """Available Teams Response: Response containing list of available teams"""
    success: bool
    data: Optional[List[Any]]
    error: Optional[str]

    class Config:
        from_attributes = True

class PlayerResponse(BaseModel):
    """Player Response: Response containing player information"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class GameSessionResponse(BaseModel):
    """Game Session Response: Response containing game session information"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class GameStateResponse(BaseModel):
    """Game State Response: Response containing complete game state"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class GameResultResponse(BaseModel):
    """Game Result Response: Response containing game result information"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class PuzzleResponse(BaseModel):
    """Puzzle Response: Response containing puzzle information"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class PuzzleResultResponse(BaseModel):
    """Puzzle Result Response: Response containing puzzle submission result"""
    success: bool
    data: Optional[Any]
    error: Optional[str]

    class Config:
        from_attributes = True

class ColorAssignmentResponse(BaseModel):
    """Color Assignment Response: Response containing color assignment result"""
    success: bool
    data: Optional[Dict[str, Any]]
    error: Optional[str]

    class Config:
        from_attributes = True

class CountdownResponse(BaseModel):
    """Countdown Response: Response containing countdown information"""
    success: bool
    data: Optional[Dict[str, Any]]
    error: Optional[str]

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    """Error Response: Standard error response"""
    success: Any
    error: str = Field(description="Error message")
    message: Optional[str] = Field(description="Additional error details")
    code: Optional[str] = Field(description="Error code")
    details: Optional[Dict[str, Any]] = Field(description="Additional error details")

    class Config:
        from_attributes = True

class SuccessResponse(BaseModel):
    """Success Response: Standard success response"""
    success: Any
    message: Optional[str] = Field(description="Success message")
    data: Optional[Any] = Field(description="Response data")

    class Config:
        from_attributes = True

class HealthCheckResponse(BaseModel):
    """Health Check Response: API health check response"""
    success: Any
    status: Literal['healthy', 'degraded', 'unhealthy']
    timestamp: datetime
    version: Optional[str] = Field(description="API version")
    uptime: Optional[float] = Field(description="Server uptime in seconds")

    class Config:
        from_attributes = True
