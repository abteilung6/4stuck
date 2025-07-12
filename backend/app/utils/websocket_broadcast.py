from typing import Dict, Set
from fastapi import WebSocket
from sqlalchemy.orm import Session
from .. import models
import json
import logging

logger = logging.getLogger(__name__)

# In-memory mapping: session_id -> set of WebSocket connections
# This is shared across all routers
connections: Dict[int, Set[WebSocket]] = {}

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
        
        state = {
            "session": {"id": session.id, "status": session.status},
            "team": {"id": team.id, "name": team.name},
            "players": [
                {"id": u.id, "username": u.username, "points": u.points} for u in users
            ],
            "puzzles": [
                {"id": p.id, "user_id": p.user_id, "type": p.type, "status": p.status, "data": p.data} for p in puzzles
            ]
        }
        
        # Broadcast to all connected clients in this session
        if session_id in connections:
            for ws in connections[session_id]:
                try:
                    await ws.send_text(json.dumps(state))
                except Exception as e:
                    logger.warning(f"Failed to send to WebSocket: {e}")
                    # Remove broken connections
                    connections[session_id].discard(ws)
    except Exception as e:
        logger.error(f"Error broadcasting state for session {session_id}: {e}") 