from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..services.countdown_service import countdown_service

router = APIRouter(prefix="/game", tags=["game"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/session", response_model=schemas.GameSessionOut)
def create_game_session(session: schemas.GameSessionCreate, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == session.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    # Only one non-finished session per team
    existing_session = db.query(models.GameSession).filter(
        models.GameSession.team_id == team.id,
        models.GameSession.status != "finished"
    ).first()
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
    
    # Broadcast state update to all connected clients
    from ..utils.websocket_broadcast import broadcast_state
    import asyncio
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_state(session_id, db))
        loop.close()
    except Exception as e:
        print(f"Failed to broadcast session creation for session {session_id}: {e}")
    
    return new_session

@router.get("/session/{team_id}", response_model=schemas.GameSessionOut)
def get_current_session(team_id: int, db: Session = Depends(get_db)):
    session = db.query(models.GameSession).filter_by(team_id=team_id).order_by(models.GameSession.id.desc()).first()
    if not session:
        raise HTTPException(status_code=404, detail="No game session for this team")
    return session

@router.post("/session/{session_id}/start", response_model=schemas.GameSessionOut)
def start_game_session(session_id: int, db: Session = Depends(get_db)):
    """Start the game (transition from countdown to active)"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    if session.status != "countdown":
        raise HTTPException(status_code=400, detail="Game session must be in countdown state to start")
    
    from datetime import datetime
    session.status = "active"
    session.started_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    
    # Broadcast state update
    from ..utils.websocket_broadcast import broadcast_state
    import asyncio
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_state(session_id, db))
        loop.close()
    except Exception as e:
        print(f"Failed to broadcast game start for session {session_id}: {e}")
    
    return session

@router.post("/session/{session_id}/state", response_model=schemas.GameSessionOut)
def update_game_session_state(session_id: int, state_update: schemas.GameSessionStateUpdate, db: Session = Depends(get_db)):
    """Update game session state (lobby, countdown, active, finished)"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    valid_states = ["lobby", "countdown", "active", "finished"]
    if state_update.status not in valid_states:
        raise HTTPException(status_code=400, detail=f"Invalid state. Must be one of: {valid_states}")
    
    # Validate state transitions
    valid_transitions = {
        "lobby": ["countdown"],
        "countdown": ["active"],
        "active": ["finished"],
        "finished": []  # No transitions from finished state
    }
    
    current_status = session.status
    if state_update.status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid state transition from '{current_status}' to '{state_update.status}'. "
                   f"Valid transitions from '{current_status}': {valid_transitions.get(current_status, [])}"
        )
    
    session.status = state_update.status
    
    # Start countdown when transitioning to countdown state
    if state_update.status == "countdown":
        if not countdown_service.start_countdown(session_id, duration_seconds=5):
            # If countdown is already running, this is fine - just log it
            print(f"Countdown already running for session {session_id}")
    
    # Set started_at when transitioning to active
    if state_update.status == "active" and not session.started_at:
        from datetime import datetime
        session.started_at = datetime.utcnow()
        
        # Initialize all players with starting points (15)
        team_users = db.query(models.User).filter(models.User.team_id == session.team_id).all()
        for user in team_users:
            user.points = 15  # Reset to starting points
        print(f"Initialized {len(team_users)} players with 15 points for session {session_id}")
        
        # Create initial puzzles for all players
        import random
        puzzle_types = ["memory", "spatial", "concentration", "multitasking"]
        for user in team_users:
            # Randomly select puzzle type
            puzzle_type = random.choice(puzzle_types)
            
            # Generate puzzle data based on type
            if puzzle_type == "memory":
                from ..routers.puzzle import generate_memory_puzzle
                data, correct_answer = generate_memory_puzzle()
            elif puzzle_type == "spatial":
                data = {}
                correct_answer = "solved"
            elif puzzle_type == "concentration":
                from ..routers.puzzle import generate_concentration_puzzle
                data, correct_answer = generate_concentration_puzzle()
            elif puzzle_type == "multitasking":
                data = {}
                correct_answer = "solved"
            
            # Create the puzzle
            new_puzzle = models.Puzzle(
                type=puzzle_type,
                data=data,
                correct_answer=correct_answer,
                status="active",
                game_session_id=session_id,
                user_id=user.id
            )
            db.add(new_puzzle)
        
        print(f"Created initial puzzles for {len(team_users)} players in session {session_id}")
    
    # Set ended_at when transitioning to finished
    if state_update.status == "finished" and not session.ended_at:
        from datetime import datetime
        session.ended_at = datetime.utcnow()
        if session.started_at:
            session.survival_time_seconds = int((session.ended_at - session.started_at).total_seconds())
    
    # Commit all changes (session status, player points, and puzzles)
    db.commit()
    db.refresh(session)
    
    # Broadcast state update AFTER committing to ensure puzzles are available
    from ..utils.websocket_broadcast import broadcast_state
    import asyncio
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_state(session_id, db))
        loop.close()
        print(f"Successfully broadcasted state update with puzzles for session {session_id}")
    except Exception as e:
        print(f"Failed to broadcast state update for session {session_id}: {e}")
    
    return session 