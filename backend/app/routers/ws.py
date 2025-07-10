from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
from .. import models, schemas, database
from sqlalchemy.orm import Session
import json

router = APIRouter(prefix="/ws", tags=["websocket"])

# In-memory mapping: session_id -> set of WebSocket connections
connections: Dict[int, Set[WebSocket]] = {}

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def broadcast_state(session_id: int, db: Session):
    # Gather full game state for the session
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        return
    team = db.query(models.Team).filter(models.Team.id == session.team_id).first()
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
    for ws in connections.get(session_id, set()):
        try:
            await ws.send_text(json.dumps(state))
        except Exception:
            pass  # Ignore send errors for now

@router.websocket("/game/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    if session_id not in connections:
        connections[session_id] = set()
    connections[session_id].add(websocket)
    try:
        # Send initial state
        await broadcast_state(session_id, db)
        while True:
            # Wait for any message (could be a ping or client action)
            data = await websocket.receive_text()
            # For MVP, just re-broadcast state on any message
            await broadcast_state(session_id, db)
    except WebSocketDisconnect:
        connections[session_id].remove(websocket)
        if not connections[session_id]:
            del connections[session_id] 