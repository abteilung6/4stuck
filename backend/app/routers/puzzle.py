from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import models, schemas, database
from ..utils.websocket_broadcast import broadcast_state
import random

router = APIRouter(prefix="/puzzle", tags=["puzzle"])

# Configurable parameters
STARTING_POINTS = 15
POINTS_AWARD = 5
DECAY_INTERVAL_SECONDS = 5
POINTS_LOST_PER_DECAY = 1

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper: Generate a memory puzzle
def generate_memory_puzzle():
    colors = ["red", "blue", "yellow", "green"]
    numbers = list(range(1, len(colors) + 1))
    random.shuffle(colors)
    mapping = {str(num): color for num, color in zip(numbers, colors)}
    question_number = random.choice(numbers)
    correct_answer = mapping[str(question_number)]
    data = {
        "mapping": mapping,
        "question_number": str(question_number),  # Convert to string for frontend validation
        "choices": colors
    }
    return data, correct_answer



# Helper: Generate a concentration puzzle (color-word matching)
def generate_concentration_puzzle(num_pairs: int = 10):
    colors = ["red", "blue", "yellow", "green", "purple", "orange"]
    pairs = []
    correct_index = random.randint(0, num_pairs - 1)
    for i in range(num_pairs):
        if i == correct_index:
            color_word = random.choice(colors)
            circle_color = color_word
            is_match = True
        else:
            color_word = random.choice(colors)
            available_colors = [c for c in colors if c != color_word]
            circle_color = random.choice(available_colors)
            is_match = False
        pairs.append({
            "color_word": color_word,
            "circle_color": circle_color,
            "is_match": is_match
        })
    data = {
        "pairs": pairs,
        "duration": 2  # seconds per pair
    }
    correct_answer = str(correct_index)
    return data, correct_answer

@router.post("/create", response_model=schemas.PuzzleState)
def create_puzzle(puzzle: schemas.PuzzleCreate, db: Session = Depends(get_db)):
    # Support multiple puzzle types
    if puzzle.type == "memory":
        data, correct_answer = generate_memory_puzzle()
    elif puzzle.type == "spatial":
        # Empty data for spatial puzzle - frontend handles everything
        data = {}
        correct_answer = "solved"
    elif puzzle.type == "concentration":
        data, correct_answer = generate_concentration_puzzle()
    elif puzzle.type == "multitasking":
        # Empty data for multitasking puzzle - frontend handles everything
        data = {}
        correct_answer = "solved"
    else:
        raise HTTPException(status_code=400, detail=f"Puzzle type '{puzzle.type}' not supported")
    
    new_puzzle = models.Puzzle(
        type=puzzle.type,
        data=data,
        correct_answer=correct_answer,
        status="active",
        game_session_id=puzzle.game_session_id,
        user_id=puzzle.user_id
    )
    db.add(new_puzzle)
    db.commit()
    db.refresh(new_puzzle)
    return schemas.PuzzleState.from_orm(new_puzzle)

@router.get("/current/{user_id}", response_model=schemas.PuzzleState)
def get_current_puzzle(user_id: int, db: Session = Depends(get_db)):
    puzzle = db.query(models.Puzzle).filter(and_(models.Puzzle.user_id == user_id, models.Puzzle.status == "active")).first()
    if not puzzle:
        raise HTTPException(status_code=404, detail="No active puzzle for this user")
    return schemas.PuzzleState.from_orm(puzzle)

@router.post("/answer", response_model=schemas.PuzzleResult)
async def submit_answer(answer: schemas.PuzzleAnswer, db: Session = Depends(get_db)):
    puzzle = db.query(models.Puzzle).filter(models.Puzzle.id == answer.puzzle_id).first()
    if not puzzle or puzzle.status != "active":
        raise HTTPException(status_code=404, detail="Puzzle not found or not active")
    user = db.query(models.User).filter(models.User.id == puzzle.user_id).first()
    if not user or user.points <= 0:
        raise HTTPException(status_code=400, detail="User not found or out of points")
    # Special logic for concentration puzzle
    if puzzle.type == "concentration":
        if answer.answer == puzzle.correct_answer:
            correct = True
        else:
            correct = False
    else:
        correct = (answer.answer == puzzle.correct_answer)
    awarded_to_user_id = None
    points_awarded = 0
    next_puzzle_id = None
    if correct:
        # Mark puzzle as solved
        puzzle.status = "solved"
        from datetime import datetime
        puzzle.solved_at = datetime.utcnow()
        db.commit()
        # Find next player in team
        team_users = db.query(models.User).filter(models.User.team_id == user.team_id).order_by(models.User.id).all()
        if len(team_users) > 1:
            idx = [u.id for u in team_users].index(user.id)
            next_idx = (idx + 1) % len(team_users)
            next_user = team_users[next_idx]
            if next_user.points > 0:
                next_user.points += POINTS_AWARD
                awarded_to_user_id = next_user.id
                points_awarded = POINTS_AWARD
                db.commit()
        # Assign new puzzle to solver (randomly choose puzzle type)
        puzzle_types = ["memory", "spatial", "concentration", "multitasking"]
        new_type = random.choice(puzzle_types)
        
        if new_type == "memory":
            new_data, new_correct = generate_memory_puzzle()
        elif new_type == "spatial":
            new_data = {}
            new_correct = "solved"
        elif new_type == "concentration":
            new_data, new_correct = generate_concentration_puzzle()
        elif new_type == "multitasking":
            new_data = {}
            new_correct = "solved"
        
        new_puzzle = models.Puzzle(
            type=new_type,
            data=new_data,
            correct_answer=new_correct,
            status="active",
            game_session_id=puzzle.game_session_id,
            user_id=user.id
        )
        db.add(new_puzzle)
        db.commit()
        db.refresh(new_puzzle)
        next_puzzle_id = new_puzzle.id
        
        # Broadcast updated state to all connected clients
        await broadcast_state(int(puzzle.game_session_id), db)
    else:
        # Mark puzzle as failed
        puzzle.status = "failed"
        db.commit()
        
        # Create a new puzzle for the user to try again (same as correct answer logic)
        puzzle_types = ["memory", "spatial", "concentration", "multitasking"]
        new_type = random.choice(puzzle_types)
        
        if new_type == "memory":
            new_data, new_correct = generate_memory_puzzle()
        elif new_type == "spatial":
            new_data = {}
            new_correct = "solved"
        elif new_type == "concentration":
            new_data, new_correct = generate_concentration_puzzle()
        elif new_type == "multitasking":
            new_data = {}
            new_correct = "solved"
        
        new_puzzle = models.Puzzle(
            type=new_type,
            data=new_data,
            correct_answer=new_correct,
            status="active",
            game_session_id=puzzle.game_session_id,
            user_id=user.id
        )
        db.add(new_puzzle)
        db.commit()
        db.refresh(new_puzzle)
        next_puzzle_id = new_puzzle.id
        
        # Broadcast updated state to all connected clients
        await broadcast_state(int(puzzle.game_session_id), db)
    
    # Return the new puzzle data if one was created
    next_puzzle_data = None
    if next_puzzle_id:
        next_puzzle = db.query(models.Puzzle).filter(models.Puzzle.id == next_puzzle_id).first()
        if next_puzzle:
            next_puzzle_data = schemas.PuzzleState.from_orm(next_puzzle)
    
    return schemas.PuzzleResult(
        correct=correct,
        awarded_to_user_id=awarded_to_user_id,
        points_awarded=points_awarded,
        next_puzzle_id=next_puzzle_id,
        next_puzzle=next_puzzle_data
    )

@router.get("/points/{team_id}", response_model=schemas.TeamPoints)
def get_team_points(team_id: int, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.team_id == team_id).all()
    players = [schemas.PlayerPoints(user_id=u.id, username=u.username, points=u.points) for u in users]
    return schemas.TeamPoints(team_id=team_id, players=players)

# Endpoint to trigger point decay for all players in a team (for now, call manually or via cron)
@router.post("/decay/{team_id}")
def decay_points(team_id: int, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.team_id == team_id).all()
    for user in users:
        if user.points > 0:
            user.points = max(0, user.points - POINTS_LOST_PER_DECAY)
    db.commit()
    return {"detail": "Points decayed for all players in team."} 