"""
Auto-generated from 4stuck/schemas/core/v1/puzzle.json
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field

class PuzzleType(BaseModel):
    """Puzzle Type: Types of puzzles available"""

    class Config:
        from_attributes = True

class PuzzleState(BaseModel):
    """Puzzle State: Current state of a puzzle for a player"""
    id: int = Field(description="Unique puzzle identifier")
    user_id: int = Field(description="ID of the player this puzzle is for")
    type: Any = Field(description="Type of puzzle")
    data: Any = Field(description="Puzzle-specific data")
    created_at: datetime = Field(description="When the puzzle was created")
    solved_at: Optional[datetime] = Field(default=None, description="When the puzzle was solved (if solved)")
    is_solved: Optional[bool] = Field(default=None, description="Whether the puzzle has been solved")
    time_limit: Optional[int] = Field(default=None, description="Time limit in seconds (if applicable)")

    class Config:
        from_attributes = True

class PuzzleData(BaseModel):
    """Puzzle Data: Union of all puzzle data types"""

    class Config:
        from_attributes = True

class MemoryPuzzleData(BaseModel):
    """Memory Puzzle Data: Data for memory puzzle (color-number association)"""
    mapping: Dict[str, Any] = Field(description="Color to number mapping")
    question_number: str = Field(description="Number to ask about")
    choices: List[str] = Field(description="Available color choices")

    class Config:
        from_attributes = True

class SpatialPuzzleData(BaseModel):
    """Spatial Puzzle Data: Data for spatial puzzle (drag circle through obstacles)"""
    start_position: Any = Field(description="Starting position for the draggable circle")
    end_position: Any = Field(description="Target end position")
    obstacles: List[Any] = Field(description="Positions of obstacles to avoid")
    circle_radius: Optional[float] = Field(default=None, description="Radius of the draggable circle")

    class Config:
        from_attributes = True

class ConcentrationPuzzleData(BaseModel):
    """Concentration Puzzle Data: Data for concentration puzzle (color-word matching)"""
    pairs: List[Dict[str, Any]] = Field(description="Sequence of color-word pairs")
    correct_index: int = Field(description="Index of the correct matching pair")
    duration: int = Field(description="Duration in seconds each pair is shown")

    class Config:
        from_attributes = True

class MultitaskingPuzzleData(BaseModel):
    """Multitasking Puzzle Data: Data for multitasking puzzle (find all sixes)"""
    rows: List[List[str]] = Field(description="Grid of numbers (mostly 9s with one 6 per row)")
    six_positions: List[Dict[str, Any]] = Field(description="Positions of all 6s in the grid")
    time_limit: int = Field(description="Time limit in seconds")

    class Config:
        from_attributes = True

class PuzzleResult(BaseModel):
    """Puzzle Result: Result of submitting a puzzle answer"""
    correct: bool = Field(description="Whether the answer was correct")
    next_puzzle: Optional[Any] = Field(default=None, description="Next puzzle for the player (if any)")
    points_awarded: Optional[int] = Field(default=None, description="Points awarded to the next player")
    message: Optional[str] = Field(default=None, description="Feedback message for the player")
    awarded_to_user_id: Optional[int] = Field(default=None, description="ID of the user who received the points")
    next_puzzle_id: Optional[int] = Field(default=None, description="ID of the next puzzle (if any)")

    class Config:
        from_attributes = True
