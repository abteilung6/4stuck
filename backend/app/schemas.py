from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserOut(BaseModel):
    id: int
    username: str
    team_id: Optional[int]
    points: int
    model_config = {'from_attributes': True}

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamOut(BaseModel):
    id: int
    name: str
    model_config = {'from_attributes': True}

class TeamWithMembersOut(TeamOut):
    members: list[UserOut]

class GameSessionCreate(BaseModel):
    team_id: int

# TODO: Consider making 'status' a StrEnum for better type safety and autocompletion.
class GameSessionStateUpdate(BaseModel):
    status: str  # lobby, countdown, active, finished

class GameSessionOut(BaseModel):
    id: int
    team_id: int
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    survival_time_seconds: Optional[int] = None
    model_config = {'from_attributes': True}

# Puzzle schemas
class PuzzleCreate(BaseModel):
    type: str  # e.g., 'memory'
    game_session_id: int
    user_id: int

class PuzzleState(BaseModel):
    id: int
    type: str
    data: Any
    status: str
    correct_answer: str
    model_config = {'from_attributes': True}

class PuzzleAnswer(BaseModel):
    puzzle_id: int
    answer: str

class PuzzleResult(BaseModel):
    correct: bool
    awarded_to_user_id: Optional[int]
    points_awarded: int
    next_puzzle_id: Optional[int]
    next_puzzle: Optional[PuzzleState] = None

# Player points reporting
class PlayerPoints(BaseModel):
    user_id: int
    username: str
    points: int

class TeamPoints(BaseModel):
    team_id: int
    players: List[PlayerPoints] 