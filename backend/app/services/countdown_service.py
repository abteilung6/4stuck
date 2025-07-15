import asyncio
import threading
import time
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
from .. import models, database
from ..utils.websocket_broadcast import broadcast_state

class CountdownService:
    """Service to handle game session countdown timing and automatic state transitions."""
    
    def __init__(self):
        self._countdown_tasks: Dict[int, threading.Timer] = {}
        self._lock = threading.Lock()
    
    def start_countdown(self, session_id: int, duration_seconds: int = 5) -> bool:
        """
        Start a countdown for a game session.
        
        Args:
            session_id: The game session ID
            duration_seconds: Countdown duration in seconds (default: 5)
            
        Returns:
            bool: True if countdown started successfully, False if already running
        """
        with self._lock:
            if session_id in self._countdown_tasks:
                return False  # Countdown already running
            
            # Create a timer that will execute after the specified duration
            timer = threading.Timer(duration_seconds, self._complete_countdown, args=[session_id])
            timer.daemon = True  # Don't prevent application shutdown
            self._countdown_tasks[session_id] = timer
            timer.start()
            return True
    
    def stop_countdown(self, session_id: int) -> bool:
        """
        Stop a countdown for a game session.
        
        Args:
            session_id: The game session ID
            
        Returns:
            bool: True if countdown was stopped, False if not running
        """
        with self._lock:
            if session_id not in self._countdown_tasks:
                return False
            
            timer = self._countdown_tasks[session_id]
            timer.cancel()
            del self._countdown_tasks[session_id]
            return True
    
    def is_countdown_running(self, session_id: int) -> bool:
        """Check if a countdown is currently running for a session."""
        with self._lock:
            return session_id in self._countdown_tasks
    
    def _complete_countdown(self, session_id: int) -> None:
        """
        Complete the countdown by transitioning the session to 'active' state.
        This method is called automatically when the countdown timer expires.
        """
        try:
            # Get a new database session for this operation
            db = database.SessionLocal()
            try:
                # Verify the session is still in countdown state
                session = db.query(models.GameSession).filter(
                    models.GameSession.id == session_id,
                    models.GameSession.status == "countdown"
                ).first()
                
                if not session:
                    # Session doesn't exist or is not in countdown state
                    print(f"Session {session_id} not found or not in countdown state")
                    return
                
                # Transition to active state
                session.status = "active"
                session.started_at = datetime.utcnow()
                db.commit()
                
                print(f"Countdown completed for session {session_id}, transitioned to active")
                
                # Broadcast the state change to all connected clients
                # Note: We'll handle broadcasting separately to avoid asyncio issues
                try:
                    # Create a new event loop for this thread if needed
                    try:
                        loop = asyncio.get_event_loop()
                    except RuntimeError:
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                    
                    loop.run_until_complete(broadcast_state(session_id, db))
                except Exception as e:
                    print(f"Failed to broadcast state change for session {session_id}: {e}")
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"Error completing countdown for session {session_id}: {e}")
        finally:
            # Clean up the timer reference
            with self._lock:
                self._countdown_tasks.pop(session_id, None)

# Global instance of the countdown service
countdown_service = CountdownService() 