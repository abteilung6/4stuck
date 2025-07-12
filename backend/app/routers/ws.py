from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from .. import models, schemas, database
from sqlalchemy.orm import Session
from ..utils.websocket_broadcast import add_connection, remove_connection, broadcast_state
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
                # For MVP, just re-broadcast state on any message
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