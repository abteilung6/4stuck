import asyncio
from datetime import datetime, timezone
import random
import threading

from sqlalchemy.orm import Session

from .. import database, models
from ..utils.websocket_broadcast import broadcast_state


class CountdownService:
    def __init__(self):
        self.active_countdowns: dict[int, asyncio.Task] = {}
        self.countdown_locks: dict[int, threading.Lock] = {}

    def start_countdown(self, session_id: int, duration_seconds: int = 5) -> bool:
        """Start a countdown for a game session"""
        with self.countdown_locks.setdefault(session_id, threading.Lock()):
            if session_id in self.active_countdowns:
                return False  # Countdown already running

            # Create new event loop for this thread
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                # Start countdown task
                task = loop.create_task(self._run_countdown(session_id, duration_seconds))
                self.active_countdowns[session_id] = task

                # Run the loop in a separate thread
                thread = threading.Thread(target=self._run_loop, args=(loop,), daemon=True)
                thread.start()

                return True
            except Exception as e:
                print(f"Failed to start countdown for session {session_id}: {e}")
                return False

    def stop_countdown(self, session_id: int) -> bool:
        """Stop a countdown for a game session"""
        with self.countdown_locks.setdefault(session_id, threading.Lock()):
            if session_id not in self.active_countdowns:
                return False

            task = self.active_countdowns[session_id]
            task.cancel()
            del self.active_countdowns[session_id]
            return True

    def is_countdown_running(self, session_id: int) -> bool:
        """Check if a countdown is running for a session"""
        return session_id in self.active_countdowns

    def _generate_memory_puzzle(self):
        """Generate a memory puzzle"""
        colors = ["red", "blue", "yellow", "green"]
        numbers = list(range(1, len(colors) + 1))
        random.shuffle(colors)
        mapping = {str(num): color for num, color in zip(numbers, colors)}
        question_number = random.choice(numbers)
        correct_answer = mapping[str(question_number)]
        data = {"mapping": mapping, "question_number": str(question_number), "choices": colors}
        return data, correct_answer

    def _generate_concentration_puzzle(self, num_pairs: int = 10):
        """Generate a concentration puzzle"""
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

    def _create_initial_puzzle_for_user(self, user_id: int, session_id: int, db: Session):
        """Create an initial puzzle for a user"""
        puzzle_types = ["memory", "spatial", "concentration", "multitasking"]
        puzzle_type = random.choice(puzzle_types)

        if puzzle_type == "memory":
            data, correct_answer = self._generate_memory_puzzle()
        elif puzzle_type == "spatial":
            data = {}
            correct_answer = "solved"
        elif puzzle_type == "concentration":
            data, correct_answer = self._generate_concentration_puzzle()
        elif puzzle_type == "multitasking":
            data = {}
            correct_answer = "solved"

        new_puzzle = models.Puzzle(
            type=puzzle_type,
            data=data,
            correct_answer=correct_answer,
            status="active",
            game_session_id=session_id,
            user_id=user_id,
        )
        db.add(new_puzzle)
        return new_puzzle

    async def _run_countdown(self, session_id: int, duration_seconds: int):
        """Run the countdown and transition to active state"""
        try:
            # Wait for the countdown duration
            await asyncio.sleep(duration_seconds)

            # Transition to active state
            db = database.SessionLocal()
            try:
                session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
                if session and session.status == "countdown":
                    session.status = "active"
                    session.started_at = datetime.now(timezone.utc)

                    # Initialize all players with starting points (15)
                    team_users = db.query(models.User).filter(models.User.team_id == session.team_id).all()
                    for user in team_users:
                        user.points = 15  # Reset to starting points

                    # Create initial puzzles for all players
                    for user in team_users:
                        self._create_initial_puzzle_for_user(user.id, session_id, db)

                    db.commit()

                    # Broadcast state update
                    await broadcast_state(session_id, db)

                    print(
                        f"Countdown completed for session {session_id}. Game is now active with {len(team_users)} players.",
                    )
                else:
                    print(f"Session {session_id} not found or not in countdown state")
            finally:
                db.close()

        except asyncio.CancelledError:
            print(f"Countdown cancelled for session {session_id}")
        except Exception as e:
            print(f"Error during countdown for session {session_id}: {e}")
        finally:
            # Clean up
            if session_id in self.active_countdowns:
                del self.active_countdowns[session_id]

    def _run_loop(self, loop: asyncio.AbstractEventLoop):
        """Run the event loop in a separate thread"""
        try:
            loop.run_forever()
        finally:
            loop.close()


# Global instance
countdown_service = CountdownService()
