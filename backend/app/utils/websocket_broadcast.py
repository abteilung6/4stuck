from typing import Dict, Set, Optional, Any
from fastapi import WebSocket
from sqlalchemy.orm import Session
from .. import models
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# In-memory mapping: session_id -> set of WebSocket connections
# This is shared across all routers
connections: Dict[int, Set[WebSocket]] = {}

# Player activity tracking: session_id -> user_id -> activity_data
player_activity: Dict[int, Dict[int, Dict[str, Any]]] = {}

# Mouse position tracking: session_id -> user_id -> position_data
mouse_positions: Dict[int, Dict[int, Dict[str, Any]]] = {}

# User color cache: session_id -> user_id -> color
user_colors: Dict[int, Dict[int, str]] = {}

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

def update_player_activity(session_id: int, user_id: int, activity_data: Dict[str, Any]):
    """Update player activity status"""
    if session_id not in player_activity:
        player_activity[session_id] = {}
    
    player_activity[session_id][user_id] = {
        **activity_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Clean up old activity data (older than 30 seconds)
    cleanup_old_activity(session_id)

def update_mouse_position(session_id: int, user_id: int, x: int, y: int, puzzle_area: Optional[str] = None):
    """Update mouse position for a player"""
    if session_id not in mouse_positions:
        mouse_positions[session_id] = {}
    
    mouse_positions[session_id][user_id] = {
        "x": x,
        "y": y,
        "puzzle_area": puzzle_area,
        "timestamp": datetime.utcnow().isoformat()
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
    cutoff_time = datetime.utcnow() - timedelta(seconds=max_age_seconds)
    
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

async def broadcast_message(session_id: int, message_type: str, data: Dict[str, Any]):
    """Broadcast a specific message type to all connected clients in a session"""
    if session_id not in connections:
        return
    
    message = {
        "type": message_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    for ws in list(connections[session_id]):
        try:
            await ws.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Failed to send {message_type} to WebSocket: {e}")
            connections[session_id].discard(ws)

async def broadcast_state(session_id: int, db: Session):
    """Broadcast the current game state to all connected clients in a session"""
    try:
        # Gather full game state for the session
        session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
        if not session:
            return
            
        team = db.query(models.Team).filter(models.Team.id == session.team_id).first()
        if not team:
            return
            
        users = db.query(models.User).filter(models.User.team_id == team.id).all()
        puzzles = db.query(models.Puzzle).filter(models.Puzzle.game_session_id == session_id).all()
        
        # Get current player activity (but NOT mouse positions - those are handled separately)
        current_activity = player_activity.get(session_id, {})
        
        state = {
            "type": "state_update",
            "data": {
                "session": {"id": session.id, "status": session.status},
                "team": {"id": team.id, "name": team.name},
                "players": [
                    {
                        "id": u.id, 
                        "username": u.username, 
                        "points": u.points,
                        "activity": current_activity.get(int(u.id), {})
                        # Removed mouse_position - this is now handled by separate mouse_cursor messages
                    } for u in users
                ],
                "puzzles": [
                    {"id": p.id, "user_id": p.user_id, "type": p.type, "status": p.status, "data": p.data} for p in puzzles
                ]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast to all connected clients in this session
        if session_id in connections:
            for ws in list(connections[session_id]):
                try:
                    await ws.send_text(json.dumps(state))
                except Exception as e:
                    logger.warning(f"Failed to send state to WebSocket: {e}")
                    connections[session_id].discard(ws)
    except Exception as e:
        logger.error(f"Error broadcasting state for session {session_id}: {e}")

async def broadcast_puzzle_interaction(session_id: int, user_id: int, puzzle_id: int, interaction_type: str, interaction_data: Dict[str, Any]):
    """Broadcast puzzle interaction events"""
    await broadcast_message(session_id, "puzzle_interaction", {
        "user_id": user_id,
        "puzzle_id": puzzle_id,
        "interaction_type": interaction_type,  # "click", "drag_start", "drag_end", "hover"
        "interaction_data": interaction_data,
        "timestamp": datetime.utcnow().isoformat()
    })

async def broadcast_team_communication(session_id: int, user_id: int, message_type: str, message_data: Dict[str, Any]):
    """Broadcast team communication events"""
    await broadcast_message(session_id, "team_communication", {
        "user_id": user_id,
        "message_type": message_type,  # "emoji_reaction", "thinking", "stress_indicator", "strategy_cue"
        "message_data": message_data,
        "timestamp": datetime.utcnow().isoformat()
    })

async def broadcast_achievement(session_id: int, user_id: int, achievement_type: str, achievement_data: Dict[str, Any]):
    """Broadcast player achievements"""
    await broadcast_message(session_id, "achievement", {
        "user_id": user_id,
        "achievement_type": achievement_type,  # "puzzle_solved", "fast_solve", "team_support"
        "achievement_data": achievement_data,
        "timestamp": datetime.utcnow().isoformat()
    })

async def broadcast_mouse_cursor(session_id: int, user_id: int, x: int, y: int, color: str, viewport: Optional[Dict[str, Any]] = None):
    """Broadcast mouse cursor position to all players in the session"""
    message_data = {
        "user_id": user_id,
        "x": x,
        "y": y,
        "color": color,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Include viewport information if provided
    if viewport:
        message_data["viewport"] = viewport
    
    await broadcast_message(session_id, "mouse_cursor", message_data) 