from pydantic import BaseModel
from typing import Optional, Any, List

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    team_id: Optional[int]
    points: int
    model_config = {'from_attributes': True}

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamOut(TeamBase):
    id: int
    model_config = {'from_attributes': True}

class GameSessionCreate(BaseModel):
    team_id: int

class GameSessionOut(BaseModel):
    id: int
    team_id: int
    status: str
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
    model_config = {'from_attributes': True}

class PuzzleAnswer(BaseModel):
    puzzle_id: int
    answer: str

class PuzzleResult(BaseModel):
    correct: bool
    awarded_to_user_id: Optional[int]
    points_awarded: int
    next_puzzle_id: Optional[int]

# Player points reporting
class PlayerPoints(BaseModel):
    user_id: int
    username: str
    points: int

class TeamPoints(BaseModel):
    team_id: int
    players: List[PlayerPoints] 