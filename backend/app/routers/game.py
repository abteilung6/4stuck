from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import database, models
from ..schemas.v1.api.requests import GameSessionCreate, GameSessionStateUpdate
from ..schemas.v1.api.responses import GameSessionResponse
from ..services.countdown_service import countdown_service
from ..utils.websocket_broadcast import cache_user_color


router = APIRouter(prefix="/game", tags=["game"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/session", response_model=GameSessionResponse)
def create_game_session(session: GameSessionCreate, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == session.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    # Only one non-finished session per team
    existing_session = (
        db.query(models.GameSession)
        .filter(models.GameSession.team_id == team.id, models.GameSession.status != "finished")
        .first()
    )
    if existing_session:
        raise HTTPException(status_code=400, detail="Game session already exists for this team")

    # Create session and immediately transition to countdown
    new_session = models.GameSession(team_id=team.id, status="countdown")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Start the countdown automatically
    session_id = new_session.id
    if not countdown_service.start_countdown(session_id, duration_seconds=5):
        print(f"Countdown already running for session {session_id}")

    # Cache user colors for WebSocket mouse cursor broadcasting
    team_users = db.query(models.User).filter(models.User.team_id == team.id).all()
    for user in team_users:
        if user.color:  # type: ignore
            cache_user_color(session_id, user.id, user.color)  # type: ignore
            print(f"[Game Session] Cached color {user.color} for user {user.username} in session {session_id}")

    # Broadcast state update to all connected clients
    import asyncio

    from ..utils.websocket_broadcast import broadcast_state

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_state(session_id, db))
        loop.close()
    except Exception as e:
        print(f"Failed to broadcast session creation for session {session_id}: {e}")

    return new_session


@router.get("/session/{team_id}", response_model=GameSessionResponse)
def get_current_session(team_id: int, db: Session = Depends(get_db)):
    session = db.query(models.GameSession).filter_by(team_id=team_id).order_by(models.GameSession.id.desc()).first()
    if not session:
        raise HTTPException(status_code=404, detail="No game session for this team")
    return session


@router.post("/session/{session_id}/start", response_model=GameSessionResponse)
def start_game_session(session_id: int, db: Session = Depends(get_db)):
    """Start the game (transition from countdown to active)"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    if session.status != "countdown":
        raise HTTPException(status_code=400, detail="Game session must be in countdown state to start")

    session.status = "active"
    session.started_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)

    # Broadcast state update
    import asyncio

    from ..utils.websocket_broadcast import broadcast_state

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_state(session_id, db))
        loop.close()
    except Exception as e:
        print(f"Failed to broadcast game start for session {session_id}: {e}")

    return session


@router.post("/session/{session_id}/state", response_model=GameSessionResponse)
def update_game_session_state(session_id: int, state_update: GameSessionStateUpdate, db: Session = Depends(get_db)):
    """Update game session state (lobby, countdown, active, finished)"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    # Validate state transition
    valid_transitions = {
        "lobby": ["countdown"],
        "countdown": ["active"],
        "active": ["finished"],
        "finished": [],  # No transitions from finished
    }

    current_status = session.status
    new_status = state_update.status

    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(status_code=400, detail=f"Invalid state transition from {current_status} to {new_status}")

    # Update session state
    session.status = new_status

    # Set timestamps for specific transitions
    if new_status == "active" and current_status == "countdown":
        session.started_at = datetime.now(timezone.utc)
    elif new_status == "finished" and current_status == "active":
        session.ended_at = datetime.now(timezone.utc)
        # Calculate survival time
        if session.started_at:
            # Handle both timezone-aware and timezone-naive datetimes
            started_at = session.started_at
            ended_at = session.ended_at

            # If started_at is timezone-naive, assume UTC
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=timezone.utc)

            survival_time = (ended_at - started_at).total_seconds()
            session.survival_time_seconds = int(survival_time)

    db.commit()
    db.refresh(session)

    # Broadcast state update
    import asyncio

    from ..utils.websocket_broadcast import broadcast_state

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_state(session_id, db))
        loop.close()
    except Exception as e:
        print(f"Failed to broadcast state update for session {session_id}: {e}")

    return session
