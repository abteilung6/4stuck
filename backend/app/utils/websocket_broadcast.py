from datetime import datetime, timedelta, timezone
import json
import logging
from typing import Any, Optional

from fastapi import WebSocket
from sqlalchemy.orm import Session

from .. import models


logger = logging.getLogger(__name__)

# In-memory mapping: session_id -> set of WebSocket connections
# This is shared across all routers
connections: dict[int, set[WebSocket]] = {}

# Player activity tracking: session_id -> user_id -> activity_data
player_activity: dict[int, dict[int, dict[str, Any]]] = {}

# Mouse position tracking: session_id -> user_id -> position_data
mouse_positions: dict[int, dict[int, dict[str, Any]]] = {}

# User color cache: session_id -> user_id -> color
user_colors: dict[int, dict[int, str]] = {}


def add_connection(session_id: int, websocket: WebSocket):
    """Add a WebSocket connection to the session"""
    if session_id not in connections:
        connections[session_id] = set()
    connections[session_id].add(websocket)


def remove_connection(session_id: int, websocket: WebSocket):
    """Remove a WebSocket connection from the session"""
    if session_id in connections:
        connections[session_id].discard(websocket)
        if not connections[session_id]:
            del connections[session_id]


def update_player_activity(session_id: int, user_id: int, activity_data: dict[str, Any]):
    """Update player activity status"""
    if session_id not in player_activity:
        player_activity[session_id] = {}

    player_activity[session_id][user_id] = {**activity_data, "timestamp": datetime.now(timezone.utc).isoformat()}

    # Clean up old activity data (older than 30 seconds)
    cleanup_old_activity(session_id)


def update_mouse_position(session_id: int, user_id: int, x: float, y: float, puzzle_area: Optional[str] = None):
    """Update mouse position for a player"""
    if session_id not in mouse_positions:
        mouse_positions[session_id] = {}

    mouse_positions[session_id][user_id] = {
        "x": x,
        "y": y,
        "puzzle_area": puzzle_area,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def cache_user_color(session_id: int, user_id: int, color: str):
    """Cache a user's color for the session"""
    if session_id not in user_colors:
        user_colors[session_id] = {}
    user_colors[session_id][user_id] = color


def get_user_color(session_id: int, user_id: int) -> Optional[str]:
    """Get a user's cached color for the session"""
    return user_colors.get(session_id, {}).get(user_id)


def clear_user_colors(session_id: int):
    """Clear all user colors for a session (when session ends)"""
    if session_id in user_colors:
        del user_colors[session_id]


def cleanup_old_activity(session_id: int, max_age_seconds: int = 30):
    """Clean up old activity data"""
    cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=max_age_seconds)

    if session_id in player_activity:
        for user_id in list(player_activity[session_id].keys()):
            activity_time = datetime.fromisoformat(player_activity[session_id][user_id]["timestamp"])
            if activity_time < cutoff_time:
                del player_activity[session_id][user_id]

    if session_id in mouse_positions:
        for user_id in list(mouse_positions[session_id].keys()):
            mouse_time = datetime.fromisoformat(mouse_positions[session_id][user_id]["timestamp"])
            if mouse_time < cutoff_time:
                del mouse_positions[session_id][user_id]


async def broadcast_message(session_id: int, message_type: str, data: dict[str, Any]):
    """Broadcast a specific message type to all connected clients in a session"""
    if session_id not in connections:
        return

    message = {"type": message_type, "data": data, "timestamp": datetime.now(timezone.utc).isoformat()}

    message_json = json.dumps(message)
    disconnected = set()

    for websocket in connections[session_id]:
        try:
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Failed to send message to WebSocket: {e}")
            disconnected.add(websocket)

    # Remove disconnected WebSockets
    for websocket in disconnected:
        remove_connection(session_id, websocket)


async def broadcast_state(session_id: int, db: Session):
    """Broadcast current game state to all connected clients"""
    if session_id not in connections:
        return

    # Get current game session
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        return

    # Get team and users
    team = db.query(models.Team).filter(models.Team.id == session.team_id).first()
    if not team:
        return

    users = db.query(models.User).filter(models.User.team_id == team.id).all()

    # Get current puzzles for each user
    puzzles = (
        db.query(models.Puzzle)
        .filter(models.Puzzle.game_session_id == session_id, models.Puzzle.status == "active")
        .all()
    )

    # Create user puzzle mapping
    user_puzzles = {puzzle.user_id: puzzle for puzzle in puzzles}

    # Build state data
    state_data = {
        "session": {
            "id": session.id,
            "status": session.status,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "ended_at": session.ended_at.isoformat() if session.ended_at else None,
            "survival_time_seconds": session.survival_time_seconds,
        },
        "team": {"id": team.id, "name": team.name},
        "players": [
            {
                "id": user.id,
                "username": user.username,
                "points": user.points,
                "color": user.color,
                "puzzle": {
                    "id": user_puzzles[user.id].id,
                    "type": user_puzzles[user.id].type,
                    "data": user_puzzles[user.id].data,
                    "status": user_puzzles[user.id].status,
                }
                if user.id in user_puzzles
                else None,
            }
            for user in users
        ],
        "puzzles": [
            {
                "id": puzzle.id,
                "type": puzzle.type,
                "data": puzzle.data,
                "status": puzzle.status,
                "user_id": puzzle.user_id,
            }
            for puzzle in puzzles
        ],
        "mouse_positions": mouse_positions.get(session_id, {}),
        "player_activity": player_activity.get(session_id, {}),
    }

    message = {"type": "state_update", "data": state_data, "timestamp": datetime.now(timezone.utc).isoformat()}

    message_json = json.dumps(message)
    disconnected = set()

    for websocket in connections[session_id]:
        try:
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Failed to send state update to WebSocket: {e}")
            disconnected.add(websocket)

    # Remove disconnected WebSockets
    for websocket in disconnected:
        remove_connection(session_id, websocket)


async def broadcast_puzzle_interaction(
    session_id: int,
    user_id: int,
    puzzle_id: int,
    interaction_type: str,
    interaction_data: dict[str, Any],
):
    """Broadcast puzzle interaction to all connected clients"""
    message_data = {
        "user_id": user_id,
        "puzzle_id": puzzle_id,
        "interaction_type": interaction_type,
        "interaction_data": interaction_data,
    }

    message = {"type": "puzzle_interaction", "data": message_data, "timestamp": datetime.now(timezone.utc).isoformat()}

    message_json = json.dumps(message)
    disconnected = set()

    for websocket in connections[session_id]:
        try:
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Failed to send puzzle interaction to WebSocket: {e}")
            disconnected.add(websocket)

    # Remove disconnected WebSockets
    for websocket in disconnected:
        remove_connection(session_id, websocket)


async def broadcast_team_communication(session_id: int, user_id: int, message_type: str, message_data: dict[str, Any]):
    """Broadcast team communication to all connected clients"""
    message_data = {"user_id": user_id, "message_type": message_type, "message_data": message_data}

    message = {"type": "team_communication", "data": message_data, "timestamp": datetime.now(timezone.utc).isoformat()}

    message_json = json.dumps(message)
    disconnected = set()

    for websocket in connections[session_id]:
        try:
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Failed to send team communication to WebSocket: {e}")
            disconnected.add(websocket)

    # Remove disconnected WebSockets
    for websocket in disconnected:
        remove_connection(session_id, websocket)


async def broadcast_achievement(session_id: int, user_id: int, achievement_type: str, achievement_data: dict[str, Any]):
    """Broadcast achievement to all connected clients"""
    message_data = {"user_id": user_id, "achievement_type": achievement_type, "achievement_data": achievement_data}

    message = {"type": "achievement", "data": message_data, "timestamp": datetime.now(timezone.utc).isoformat()}

    message_json = json.dumps(message)
    disconnected = set()

    for websocket in connections[session_id]:
        try:
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Failed to send achievement to WebSocket: {e}")
            disconnected.add(websocket)

    # Remove disconnected WebSockets
    for websocket in disconnected:
        remove_connection(session_id, websocket)


async def broadcast_mouse_cursor(
    session_id: int,
    user_id: int,
    x: float,
    y: float,
    color: str,
    viewport: Optional[dict[str, Any]] = None,
):
    """Broadcast mouse cursor position to all connected clients"""
    message_data = {"user_id": user_id, "x": x, "y": y, "color": color, "viewport": viewport}

    message = {"type": "mouse_cursor", "data": message_data, "timestamp": datetime.now(timezone.utc).isoformat()}

    message_json = json.dumps(message)
    disconnected = set()

    for websocket in connections[session_id]:
        try:
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Failed to send mouse cursor to WebSocket: {e}")
            disconnected.add(websocket)

    # Remove disconnected WebSockets
    for websocket in disconnected:
        remove_connection(session_id, websocket)
