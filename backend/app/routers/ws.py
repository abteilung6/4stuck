from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from .. import database, models
from ..utils.websocket_broadcast import (
    add_connection, remove_connection, broadcast_state, 
    broadcast_puzzle_interaction, broadcast_team_communication, 
    broadcast_achievement, broadcast_mouse_cursor, get_user_color,
    update_mouse_position, update_player_activity
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
                
                # Parse and validate the incoming message using generated schemas
                try:
                    incoming_message = IncomingMessage.model_validate_json(data)
                except ValidationError as e:
                    # Send error message back to client for invalid messages
                    error_message = {
                        "type": "error",
                        "message": "Invalid message format",
                        "details": e.errors()
                    }
                    await websocket.send_text(json.dumps(error_message))
                    continue
                
                # Handle different message types
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
                
                else:
                    # Unknown message type - just re-broadcast state
                    await broadcast_state(session_id, db)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                break
    finally:
        remove_connection(session_id, websocket) 