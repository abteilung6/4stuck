"""
Auto-generated from 4stuck/schemas/core/v1/communication.json
"""

from datetime import datetime
from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class Position(BaseModel):
    """Position: 2D position coordinates"""

    x: float = Field(description="X coordinate")
    y: float = Field(description="Y coordinate")

    class Config:
        from_attributes = True


class PlayerColor(BaseModel):
    """Player Color: Available player colors"""

    class Config:
        from_attributes = True


class MousePosition(BaseModel):
    """Mouse Position: Real-time mouse cursor position for a player"""

    user_id: int = Field(description="ID of the player whose mouse position this represents")
    x: float = Field(description="X coordinate of mouse position")
    y: float = Field(description="Y coordinate of mouse position")
    timestamp: datetime = Field(description="When this position was recorded")
    color: Optional[Any] = Field(default=None, description="Color of the player for cursor display")
    normalized_x: Optional[float] = Field(
        default=None,
        description="Normalized X coordinate (0-1) for cross-browser consistency",
    )
    normalized_y: Optional[float] = Field(
        default=None,
        description="Normalized Y coordinate (0-1) for cross-browser consistency",
    )

    class Config:
        from_attributes = True


class PuzzleInteraction(BaseModel):
    """Puzzle Interaction: Player interaction with a puzzle"""

    user_id: int = Field(description="ID of the player making the interaction")
    puzzle_id: int = Field(description="ID of the puzzle being interacted with")
    interaction_type: Literal["click", "drag", "submit", "timeout", "start", "complete"] = Field(
        description="Type of interaction performed",
    )
    interaction_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional data specific to the interaction type",
    )
    timestamp: Optional[datetime] = Field(default=None, description="When the interaction occurred")

    class Config:
        from_attributes = True
