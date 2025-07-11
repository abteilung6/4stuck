from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/team", tags=["team"])

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = models.User(username=user.username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/create", response_model=schemas.TeamOut)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db)):
    db_team = db.query(models.Team).filter(models.Team.name == team.name).first()
    if db_team:
        raise HTTPException(status_code=400, detail="Team name already exists")
    new_team = models.Team(name=team.name)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team

@router.post("/join", response_model=schemas.UserOut)
def join_team(username: str, team_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    user.team_id = team_id
    db.commit()
    db.refresh(user)
    return user

@router.get("/", response_model=list[schemas.TeamWithMembersOut])
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(models.Team).all()
    result = []
    for team in teams:
        members = [schemas.UserOut.model_validate(user) for user in team.users]
        team_out = schemas.TeamWithMembersOut(
            id=team.id,
            name=team.name,
            members=members
        )
        result.append(team_out)
    return result 