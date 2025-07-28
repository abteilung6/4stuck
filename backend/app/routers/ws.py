from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from .. import database, models
from ..utils.websocket_broadcast import (
    add_connection, remove_connection, broadcast_state, 
    broadcast_puzzle_interaction, broadcast_team_communication, 
    broadcast_achievement, broadcast_mouse_cursor, get_user_color,
    update_mouse_position
)
from ..schemas.v1.websocket.messages import IncomingMessage, MousePositionMessage, PuzzleInteractionMessage
from pydantic import ValidationError
import json


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
    await websocket.accept()
    
    add_connection(session_id, websocket)
    
    try:
        # Send initial state
        await broadcast_state(session_id, db)
        while True:
            try:
                data = await websocket.receive_text()
                
                # Parse the incoming message using generated schemas
                try:
                    # Parse and validate the incoming message
                    incoming_message = IncomingMessage.parse_raw(data)
                except ValidationError as e:
                    # Send error message back to client for invalid messages
                    error_message = {
                        "type": "error",
                        "message": "Invalid message format",
                        "details": e.errors()
                    }
                    await websocket.send_text(json.dumps(error_message))
                    continue
                    
                    if incoming_message.type == "ping":
                        # Simple ping - just re-broadcast state
                        await broadcast_state(session_id, db)
                    
                    elif incoming_message.type == "mouse_position":
                        # Handle mouse position updates with validated data
                        if incoming_message.user_id and incoming_message.x is not None and incoming_message.y is not None:
                            update_mouse_position(session_id, incoming_message.user_id, incoming_message.x, incoming_message.y, None)
                            
                            # Get the user's color for the cursor
                            color = get_user_color(session_id, incoming_message.user_id)
                            if color:
                                # Send separate mouse_cursor message to all other players
                                await broadcast_mouse_cursor(session_id, incoming_message.user_id, incoming_message.x, incoming_message.y, color, None)
                    
                    elif incoming_message.type == "puzzle_interaction":
                        # Handle puzzle interaction events with validated data
                        if incoming_message.user_id and incoming_message.puzzle_id and incoming_message.interaction_type:
                            await broadcast_puzzle_interaction(
                                session_id, incoming_message.user_id, incoming_message.puzzle_id, 
                                incoming_message.interaction_type, incoming_message.interaction_data or {}
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
                        
                except json.JSONDecodeError as e:
                    await broadcast_state(session_id, db)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                break
    finally:
        remove_connection(session_id, websocket) 