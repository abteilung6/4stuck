from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    team_id: Optional[int]
    class Config:
        orm_mode = True

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamOut(TeamBase):
    id: int
    class Config:
        orm_mode = True

class GameSessionCreate(BaseModel):
    team_id: int

class GameSessionOut(BaseModel):
    id: int
    team_id: int
    status: str
    class Config:
        orm_mode = True 