from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

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
    # Only one active session per team
    active = db.query(models.GameSession).filter_by(team_id=team.id, status="active").first()
    if active:
        raise HTTPException(status_code=400, detail="Active game session already exists for this team")
    new_session = models.GameSession(team_id=team.id, status="active")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/session/{team_id}", response_model=schemas.GameSessionOut)
def get_current_session(team_id: int, db: Session = Depends(get_db)):
    session = db.query(models.GameSession).filter_by(team_id=team_id, status="active").first()
    if not session:
        raise HTTPException(status_code=404, detail="No active game session for this team")
    return session 