from pydantic import BaseModel
from typing import Optional, Any, List, Dict
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
    color: Optional[str] = None
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

class AvailableTeamOut(BaseModel):
    id: int
    name: str
    members: list[UserOut]
    player_count: int
    max_players: int = 4
    status: str  # "available", "full", "in_game"
    game_session_id: Optional[int] = None
    game_status: Optional[str] = None  # lobby, countdown, active, finished
    model_config = {'from_attributes': True}

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

class ColorAssignmentRequest(BaseModel):
    user_id: int
    team_id: int

class ColorAssignmentResponse(BaseModel):
    user_id: int
    color: str
    success: bool
    message: str

class TeamColorValidationResponse(BaseModel):
    team_id: int
    is_valid: bool
    conflicts: List[Dict[str, Any]]

class ColorConflictResolutionResponse(BaseModel):
    team_id: int
    reassignments: Dict[str, str]
    success: bool
    message: str

class AvailableColorsResponse(BaseModel):
    team_id: int
    available_colors: List[str]
    used_colors: List[str] 