from datetime import datetime, timezone
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from .. import database, models
from ..schemas.v1.api.requests import PuzzleAnswer, PuzzleCreate
from ..schemas.v1.api.responses import PlayerPoints, PuzzleAnswerResponse, PuzzleStateResponse, TeamPoints
from ..utils.websocket_broadcast import broadcast_state


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
        "choices": colors,
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
        pairs.append({"color_word": color_word, "circle_color": circle_color, "is_match": is_match})
    data = {
        "pairs": pairs,
        "duration": 2,  # seconds per pair
    }
    correct_answer = str(correct_index)
    return data, correct_answer


@router.post("/create", response_model=PuzzleStateResponse)
def create_puzzle(puzzle: PuzzleCreate, db: Session = Depends(get_db)):
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

    new_puzzle = models.Puzzle()
    new_puzzle.type = puzzle.type
    new_puzzle.data = data
    new_puzzle.correct_answer = correct_answer
    new_puzzle.status = "active"
    new_puzzle.game_session_id = puzzle.game_session_id
    new_puzzle.user_id = puzzle.user_id
    db.add(new_puzzle)
    db.commit()
    db.refresh(new_puzzle)

    return new_puzzle


@router.get("/current/{user_id}", response_model=PuzzleStateResponse)
def get_current_puzzle(user_id: int, db: Session = Depends(get_db)):
    puzzle = (
        db.query(models.Puzzle).filter(and_(models.Puzzle.user_id == user_id, models.Puzzle.status == "active")).first()
    )
    if not puzzle:
        raise HTTPException(status_code=404, detail="No active puzzle found for this user")
    return puzzle


@router.post("/answer", response_model=PuzzleAnswerResponse)
async def submit_answer(answer: PuzzleAnswer, db: Session = Depends(get_db)):
    """Submit an answer to a puzzle and handle point distribution"""
    # Get the puzzle
    puzzle = db.query(models.Puzzle).filter(models.Puzzle.id == answer.puzzle_id).first()
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    if puzzle.status != "active":
        raise HTTPException(status_code=400, detail="Puzzle is not active")

    # Get the user who submitted the answer
    user = db.query(models.User).filter(models.User.id == answer.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user is eliminated (0 points)
    if user.points <= 0:
        raise HTTPException(status_code=400, detail="Eliminated players cannot answer puzzles")

    # Check if answer is correct
    correct = puzzle.correct_answer == answer.answer
    puzzle.status = "solved" if correct else "failed"
    puzzle.solved_at = datetime.now(timezone.utc)

    # Get the team
    team = db.query(models.Team).filter(models.Team.id == user.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Get all team members
    team_users = db.query(models.User).filter(models.User.team_id == team.id).order_by(models.User.id).all()

    awarded_to_user_id = None

    if correct:
        # Find the next player in the team (round-robin)
        current_user_index = next((i for i, u in enumerate(team_users) if u.id == user.id), -1)
        if current_user_index != -1 and len(team_users) > 1:
            next_user_index = (current_user_index + 1) % len(team_users)
            next_user = team_users[next_user_index]

            # Only award points if the next player is not eliminated
            if next_user.points > 0:
                next_user.points += POINTS_AWARD
                awarded_to_user_id = next_user.id

                print(
                    f"[Puzzle Solved] User {user.username} solved puzzle {puzzle.id}. "
                    f"Awarded {POINTS_AWARD} points to {next_user.username} (next in team)",
                )
            else:
                print(
                    f"[Puzzle Solved] User {user.username} solved puzzle {puzzle.id}. "
                    f"Next player {next_user.username} is eliminated, no points awarded",
                )
        else:
            print(
                f"[Puzzle Solved] User {user.username} solved puzzle {puzzle.id}. "
                f"Single player team or could not find next user, no points awarded",
            )
    else:
        print(
            f"[Puzzle Failed] User {user.username} failed puzzle {puzzle.id}. "
            f"Answer: {answer.answer}, Correct: {puzzle.correct_answer}",
        )

    db.commit()

    # Create next puzzle for the user who answered the current one (both correct and incorrect)
    # Generate a new random puzzle
    import random

    puzzle_types = ["memory", "spatial", "concentration", "multitasking"]
    next_puzzle_type = random.choice(puzzle_types)

    if next_puzzle_type == "memory":
        data, correct_answer = generate_memory_puzzle()
    elif next_puzzle_type == "spatial":
        data = {}
        correct_answer = "solved"
    elif next_puzzle_type == "concentration":
        data, correct_answer = generate_concentration_puzzle()
    elif next_puzzle_type == "multitasking":
        data = {}
        correct_answer = "solved"

    next_puzzle = models.Puzzle()
    next_puzzle.type = next_puzzle_type
    next_puzzle.data = data
    next_puzzle.correct_answer = correct_answer
    next_puzzle.status = "active"
    next_puzzle.game_session_id = puzzle.game_session_id
    next_puzzle.user_id = user.id
    db.add(next_puzzle)
    db.commit()
    db.refresh(next_puzzle)

    # Convert to response model
    from ..schemas.v1.api.responses import PuzzleStateResponse

    next_puzzle_data = PuzzleStateResponse.model_validate(next_puzzle)

    return PuzzleAnswerResponse(
        correct=correct,
        points_awarded=POINTS_AWARD if awarded_to_user_id else 0,
        message=f"{'Correct' if correct else 'Incorrect'}! {POINTS_AWARD if awarded_to_user_id else 0} points awarded to next player."
        if correct
        else "Incorrect answer. Try again!",
        next_puzzle=next_puzzle_data,
        awarded_to_user_id=awarded_to_user_id,
        next_puzzle_id=next_puzzle.id,
    )


@router.get("/points/{team_id}", response_model=TeamPoints)
def get_team_points(team_id: int, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.team_id == team_id).all()
    players = [PlayerPoints(user_id=u.id, username=u.username, points=u.points) for u in users]
    return TeamPoints(team_id=team_id, players=players)


@router.post("/decay/{team_id}")
def decay_points(team_id: int, db: Session = Depends(get_db)):
    """Decay points for all players in a team (called by background task)"""
    users = db.query(models.User).filter(models.User.team_id == team_id).all()

    for user in users:
        if user.points > 0:
            user.points = max(0, user.points - POINTS_LOST_PER_DECAY)
            print(f"[Point Decay] User {user.username} lost {POINTS_LOST_PER_DECAY} point(s). New total: {user.points}")

    db.commit()

    # Broadcast updated state
    # Find the active game session for this team
    session = (
        db.query(models.GameSession)
        .filter(and_(models.GameSession.team_id == team_id, models.GameSession.status == "active"))
        .first()
    )

    if session:
        import asyncio

        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(broadcast_state(session.id, db))
            loop.close()
        except Exception as e:
            print(f"Failed to broadcast point decay for session {session.id}: {e}")

    return {"message": f"Decayed {POINTS_LOST_PER_DECAY} point(s) for {len(users)} users"}
