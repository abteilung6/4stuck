import asyncio
import threading
from datetime import datetime, timezone
from typing import Dict, Optional
from sqlalchemy.orm import Session
from .. import models, database
from ..utils.websocket_broadcast import broadcast_state

class CountdownService:
    def __init__(self):
        self.active_countdowns: Dict[int, asyncio.Task] = {}
        self.countdown_locks: Dict[int, threading.Lock] = {}
    
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
                    
                    db.commit()
                    
                    # Broadcast state update
                    await broadcast_state(session_id, db)
                    
                    print(f"Countdown completed for session {session_id}. Game is now active.")
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