from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from .. import models, schemas, database
from sqlalchemy.orm import Session
from ..utils.websocket_broadcast import (
    add_connection, remove_connection, broadcast_state,
    update_player_activity, update_mouse_position,
    broadcast_puzzle_interaction, broadcast_team_communication,
    broadcast_achievement
)
import json
import logging
logging.basicConfig(level=logging.INFO)

router = APIRouter(prefix="/ws", tags=["websocket"])

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.websocket("/game/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)):
    logging.info(f"[WS] About to accept websocket for session {session_id}")
    await websocket.accept()
    logging.info(f"[WS] Websocket accepted for session {session_id}")
    
    add_connection(session_id, websocket)
    
    try:
        # Send initial state
        await broadcast_state(session_id, db)
        while True:
            logging.info(f"[WS] Waiting to receive text for session {session_id}")
            try:
                data = await websocket.receive_text()
                logging.info(f"[WS] Received data for session {session_id}: {data}")
                
                # Parse the incoming message
                try:
                    message = json.loads(data)
                    message_type = message.get("type", "ping")
                    
                    if message_type == "ping":
                        # Simple ping - just re-broadcast state
                        await broadcast_state(session_id, db)
                    
                    elif message_type == "mouse_position":
                        # Handle mouse position updates
                        user_id = message.get("user_id")
                        x = message.get("x")
                        y = message.get("y")
                        puzzle_area = message.get("puzzle_area")
                        
                        if user_id and x is not None and y is not None:
                            update_mouse_position(session_id, user_id, x, y, puzzle_area)
                            # Broadcast to other players
                            await broadcast_state(session_id, db)
                    
                    elif message_type == "puzzle_interaction":
                        # Handle puzzle interaction events
                        user_id = message.get("user_id")
                        puzzle_id = message.get("puzzle_id")
                        interaction_type = message.get("interaction_type")
                        interaction_data = message.get("interaction_data", {})
                        
                        if user_id and puzzle_id and interaction_type:
                            await broadcast_puzzle_interaction(
                                session_id, user_id, puzzle_id, interaction_type, interaction_data
                            )
                    
                    elif message_type == "team_communication":
                        # Handle team communication events
                        user_id = message.get("user_id")
                        comm_type = message.get("message_type")
                        comm_data = message.get("message_data", {})
                        
                        if user_id and comm_type:
                            await broadcast_team_communication(
                                session_id, user_id, comm_type, comm_data
                            )
                    
                    elif message_type == "player_activity":
                        # Handle player activity updates
                        user_id = message.get("user_id")
                        activity_data = message.get("activity_data", {})
                        
                        if user_id and activity_data:
                            update_player_activity(session_id, user_id, activity_data)
                            # Broadcast to other players
                            await broadcast_state(session_id, db)
                    
                    elif message_type == "achievement":
                        # Handle achievement broadcasts
                        user_id = message.get("user_id")
                        achievement_type = message.get("achievement_type")
                        achievement_data = message.get("achievement_data", {})
                        
                        if user_id and achievement_type:
                            await broadcast_achievement(
                                session_id, user_id, achievement_type, achievement_data
                            )
                    
                    else:
                        # Unknown message type - just re-broadcast state
                        await broadcast_state(session_id, db)
                        
                except json.JSONDecodeError:
                    logging.warning(f"[WS] Invalid JSON received for session {session_id}: {data}")
                    # Re-broadcast state on invalid JSON
                    await broadcast_state(session_id, db)
                    
            except RuntimeError as e:
                if "WebSocket is not connected" in str(e):
                    logging.info(f"[WS] Client disconnected immediately for session {session_id}")
                    break
                else:
                    raise
    except WebSocketDisconnect:
        logging.info(f"[WS] WebSocketDisconnect for session {session_id}")
    except Exception as e:
        logging.error(f"[WS] Exception in websocket for session {session_id}: {e}")
    finally:
        # Clean up connection
        remove_connection(session_id, websocket)
        logging.info(f"[WS] Connection cleaned up for session {session_id}") 