"""
Auto-generated from 4stuck/schemas/websocket/v1/messages.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class MessageType(BaseModel):
    """Message Type: Types of WebSocket messages"""

    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    """WebSocket Message: Base structure for all WebSocket messages"""
    type: Any = Field(description="Type of message")
    timestamp: datetime = Field(description="When the message was sent")
    session_id: Optional[int] = Field(default=None, description="Game session ID this message belongs to")
    user_id: Optional[int] = Field(default=None, description="ID of the user sending the message (for incoming messages)")
    data: Optional[Any] = Field(default=None, description="Message-specific data payload")

    class Config:
        from_attributes = True

class IncomingMessage(BaseModel):
    """Incoming Message: Message sent from client to server"""
    type: Literal['mouse_position', 'puzzle_interaction', 'ping', 'team_communication', 'player_activity', 'achievement']
    user_id: Optional[int] = Field(default=None, description="ID of the user sending the message")
    x: Optional[float] = Field(default=None, description="X coordinate (for mouse_position)")
    y: Optional[float] = Field(default=None, description="Y coordinate (for mouse_position)")
    normalized_x: Optional[float] = Field(default=None, description="Normalized X coordinate (0-1)")
    normalized_y: Optional[float] = Field(default=None, description="Normalized Y coordinate (0-1)")
    puzzle_id: Optional[int] = Field(default=None, description="Puzzle ID (for puzzle_interaction)")
    interaction_type: Optional[Literal['click', 'drag', 'submit', 'timeout', 'start', 'complete']] = Field(default=None, description="Type of puzzle interaction")
    interaction_data: Optional[Dict[str, Any]] = Field(default=None, description="Additional interaction data")
    answer: Optional[str] = Field(default=None, description="Puzzle answer (for submit interaction)")
    message_type: Optional[str] = Field(default=None, description="Type of team communication or achievement")
    message_data: Optional[Dict[str, Any]] = Field(default=None, description="Additional data for team communication or achievement")
    activity_data: Optional[Dict[str, Any]] = Field(default=None, description="Player activity data")

    class Config:
        from_attributes = True

class OutgoingMessage(BaseModel):
    """Outgoing Message: Message sent from server to client"""
    type: Any = Field(description="Type of message")
    timestamp: datetime = Field(description="When the message was sent")
    data: Optional[Any] = Field(default=None, description="Message-specific data payload")

    class Config:
        from_attributes = True

class MousePositionMessage(BaseModel):
    """Mouse Position Message: Real-time mouse position broadcast"""
    type: Any
    timestamp: datetime
    data: Any

    class Config:
        from_attributes = True

class PuzzleInteractionMessage(BaseModel):
    """Puzzle Interaction Message: Puzzle interaction broadcast"""
    type: Any
    timestamp: datetime
    data: Any

    class Config:
        from_attributes = True

class StateUpdateMessage(BaseModel):
    """State Update Message: Game state update broadcast"""
    type: Any
    timestamp: datetime
    data: Any

    class Config:
        from_attributes = True

class GameEventMessage(BaseModel):
    """Game Event Message: Game event notification"""
    type: Any
    timestamp: datetime
    data: Dict[str, Any]

    class Config:
        from_attributes = True

class ErrorMessage(BaseModel):
    """Error Message: Error notification from server"""
    type: Any
    timestamp: datetime
    data: Dict[str, Any]

    class Config:
        from_attributes = True

class PingMessage(BaseModel):
    """Ping Message: Ping message for connection health check"""
    type: Any
    timestamp: datetime

    class Config:
        from_attributes = True

class PongMessage(BaseModel):
    """Pong Message: Pong response to ping"""
    type: Any
    timestamp: datetime

    class Config:
        from_attributes = True
