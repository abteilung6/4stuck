from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from .. import models, schemas, database
from ..utils.websocket_broadcast import cache_user_color
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

router = APIRouter(prefix="/team", tags=["team"])

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_team_availability_status(team: models.Team, db: Session) -> tuple[str, Optional[int], Optional[str]]:
    """
    Determine team availability status.
    Returns: (status, game_session_id, game_status)
    """
    # Check if team has an active game session
    active_session = db.query(models.GameSession).filter(
        and_(
            models.GameSession.team_id == team.id,
            models.GameSession.status.in_(["lobby", "countdown", "active"])
        )
    ).first()
    
    if active_session:
        return "in_game", active_session.id, active_session.status
    
    # Check if team is full (4 players) - regardless of game status
    member_count = len(team.users)
    if member_count >= 4:
        return "full", None, None
    
    # Team is available (has fewer than 4 players and no active game)
    return "available", None, None

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
    
    print(f"[Team Join] User {username} (ID: {user.id}) joining team {team.name} (ID: {team_id})")
    user.team_id = team_id
    
    # Assign color based on order of joining (if not already assigned)
    if not user.color:
        team_members = db.query(models.User).filter(models.User.team_id == team_id).all()
        colors = ["red", "blue", "yellow", "green"]
        used_colors = [member.color for member in team_members if member.color]
        
        # Find first available color
        available_color = None
        for color in colors:
            if color not in used_colors:
                available_color = color
                break
        
        if available_color:
            user.color = available_color
            print(f"[Team Join] Assigned color {available_color} to user {username}")
        else:
            # Fallback if all colors are used
            user.color = "gray"
            print(f"[Team Join] All colors used, assigned gray to user {username}")
    
    db.commit()
    db.refresh(user)
    
    # Cache the user color for WebSocket mouse cursor broadcasting
    if user.color:  # type: ignore
        # Get the game session for this team to cache the color
        game_session = db.query(models.GameSession).filter(models.GameSession.team_id == team_id).first()
        if game_session:
            cache_user_color(game_session.id, user.id, user.color)  # type: ignore
            print(f"[Team Join] Cached color {user.color} for user {username} in session {game_session.id}")
    
    # Verify the join worked
    updated_user = db.query(models.User).filter(models.User.username == username).first()
    print(f"[Team Join] After join - User {username} team_id: {updated_user.team_id}, color: {updated_user.color}")
    
    return user

@router.get("/available", response_model=list[schemas.AvailableTeamOut])
def get_available_teams(db: Session = Depends(get_db)):
    """
    Get only teams that are available for players to join.
    A team is available if:
    1. It has fewer than 4 players
    2. It has no active game session (lobby, countdown, active)
    """
    teams = db.query(models.Team).all()
    available_teams = []
    
    for team in teams:
        status, game_session_id, game_status = get_team_availability_status(team, db)
        
        # Only include available teams
        if status == "available":
            members = [schemas.UserOut.model_validate(user) for user in team.users]
            team_out = schemas.AvailableTeamOut(
                id=team.id,
                name=team.name,
                members=members,
                player_count=len(team.users),
                status=status,
                game_session_id=game_session_id,
                game_status=game_status
            )
            available_teams.append(team_out)
    
    return available_teams

@router.get("/", response_model=list[schemas.TeamWithMembersOut])
def list_teams(db: Session = Depends(get_db)):
    """
    List all teams (for admin/debug purposes).
    For user-facing team listing, use /team/available instead.
    """
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