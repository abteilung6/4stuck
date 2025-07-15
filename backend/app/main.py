from fastapi import FastAPI
from .database import init_db, SessionLocal
from .routers.team import router as team_router
from .routers.game import router as game_router
from .routers.puzzle import router as puzzle_router
from .routers.ws import router as ws_router
from .utils.websocket_broadcast import broadcast_state
from .services.game_end_service import game_end_service
import threading
import time
from fastapi.middleware.cors import CORSMiddleware

DECAY_INTERVAL_SECONDS = 5
POINTS_LOST_PER_DECAY = 1

app = FastAPI()

# CORS setup: allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "127.0.0.1:5173", "localhost:5173", "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    def decay_loop():
        while True:
            time.sleep(DECAY_INTERVAL_SECONDS)
            db = SessionLocal()
            try:
                from app.models import User, GameSession
                users = db.query(User).all()
                # At runtime, user.points is an int (not a Column); linter may show false positives here.
                sessions_to_update = set()
                for user in users:
                    if hasattr(user, 'points') and isinstance(user.points, int) and user.points > 0:
                        user.points = max(0, user.points - POINTS_LOST_PER_DECAY)
                        # Track which sessions need updates
                        if user.team_id:
                            sessions = db.query(GameSession).filter(GameSession.team_id == user.team_id).all()
                            for session in sessions:
                                sessions_to_update.add(session.id)
                
                # Use the game end service to check for game end conditions
                ended_sessions = game_end_service.check_and_handle_game_end(db)
                sessions_to_update.update(ended_sessions)
                
                db.commit()
                
                # Broadcast updates to all affected sessions
                for session_id in sessions_to_update:
                    try:
                        import asyncio
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                        loop.run_until_complete(broadcast_state(session_id, db))
                        loop.close()
                    except Exception as e:
                        print(f"Failed to broadcast decay update for session {session_id}: {e}")
            finally:
                db.close()
    thread = threading.Thread(target=decay_loop, daemon=True)
    thread.start()

app.include_router(team_router)
app.include_router(game_router)
app.include_router(puzzle_router)
app.include_router(ws_router)

@app.get("/")
def read_root():
    return {"message": "Team.försvarsmakten backend is running!"}
