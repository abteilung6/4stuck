import json
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.routers.game import (
    get_db as get_db_game,
    router as game_router,
)
from app.routers.puzzle import (
    get_db as get_db_puzzle,
    router as puzzle_router,
)
from app.routers.team import (
    get_db as get_db_team,
    router as team_router,
)
from app.routers.ws import (
    get_db as get_db_ws,
    router as ws_router,
)


# Helper to create a fresh app and DB for each test
def create_test_app_and_client():
    import tempfile

    tmp = tempfile.NamedTemporaryFile(suffix=".db")
    TEST_DATABASE_URL = f"sqlite:///{tmp.name}"
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = FastAPI()
    app.include_router(team_router)
    app.include_router(game_router)
    app.include_router(puzzle_router)
    app.include_router(ws_router)
    app.dependency_overrides[get_db_team] = override_get_db
    app.dependency_overrides[get_db_game] = override_get_db
    app.dependency_overrides[get_db_puzzle] = override_get_db
    app.dependency_overrides[get_db_ws] = override_get_db
    client = TestClient(app)
    return client, tmp


def create_team_user_session(client):
    unique = str(uuid4())
    username = f"testuser_{unique}"
    teamname = f"TestTeam_{unique}"
    user_resp = client.post("/team/register", json={"username": username})
    team_resp = client.post("/team/create", json={"name": teamname})
    user_id = user_resp.json()["id"]
    team_id = team_resp.json()["id"]
    join_resp = client.post(f"/team/join?username={username}&team_id={team_id}")
    session_resp = client.post("/game/session", json={"team_id": team_id})
    session_id = session_resp.json()["id"]
    return user_id, team_id, session_id


def test_ws_connect_and_receive_state():
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)
    # Create a puzzle for the user
    client.post("/puzzle/create", json={"type": "memory", "game_session_id": session_id, "user_id": user_id})
    with client.websocket_connect(f"/ws/game/{session_id}") as ws:
        # Receive initial state
        data = ws.receive_text()
        message = json.loads(data)
        assert "type" in message
        assert message["type"] == "state_update"
        assert "data" in message

        state = message["data"]
        assert "session" in state
        assert "team" in state
        assert "players" in state
        assert "puzzles" in state
        assert state["session"]["id"] == session_id
        assert state["team"]["id"] == team_id
        assert len(state["players"]) == 1
        assert len(state["puzzles"]) == 1

        # Send a ping and receive another state update
        ws.send_text('{"type": "ping"}')
        data2 = ws.receive_text()
        message2 = json.loads(data2)
        assert message2["type"] == "state_update"
        state2 = message2["data"]
        assert state2["session"]["id"] == session_id
    tmp.close()


def test_ws_multiple_clients_receive_updates():
    """
    This test is skipped because FastAPI's TestClient does not share in-memory state (like the 'connections' dict)
    between WebSocket connections. Thus, broadcast logic cannot be tested in this environment.
    For true multi-client WebSocket broadcast testing, use an integration test with a running server.
    """
    pytest.skip(
        "Cannot test multi-client WebSocket broadcast with FastAPI TestClient due to in-memory state isolation.",
    )


def test_ws_message_validation():
    """Test WebSocket message validation for different message types"""
    from app.schemas.v1.websocket.messages import IncomingMessage

    # Test ping message
    ping_msg = IncomingMessage.model_validate_json('{"type": "ping"}')
    assert ping_msg.type == "ping"
    assert ping_msg.user_id is None

    # Test mouse position message
    mouse_msg = IncomingMessage.model_validate_json('{"type": "mouse_position", "user_id": 1, "x": 150, "y": 200}')
    assert mouse_msg.type == "mouse_position"
    assert mouse_msg.user_id == 1
    assert mouse_msg.x == 150.0
    assert mouse_msg.y == 200.0

    # Test puzzle interaction message
    puzzle_msg = IncomingMessage.model_validate_json(
        '{"type": "puzzle_interaction", "user_id": 1, "puzzle_id": 123, "interaction_type": "submit", "answer": "blue"}',
    )
    assert puzzle_msg.type == "puzzle_interaction"
    assert puzzle_msg.user_id == 1
    assert puzzle_msg.puzzle_id == 123
    assert puzzle_msg.interaction_type == "submit"
    assert puzzle_msg.answer == "blue"


def test_ws_invalid_message_handling():
    """Test WebSocket handling of invalid messages"""
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)

    with client.websocket_connect(f"/ws/game/{session_id}") as ws:
        # Receive initial state
        data = ws.receive_text()
        message = json.loads(data)
        assert message["type"] == "state_update"

        # Send invalid message (missing type)
        ws.send_text('{"user_id": 1}')
        error_data = ws.receive_text()
        error_message = json.loads(error_data)
        assert error_message["type"] == "error"
        assert "Invalid message format" in error_message["message"]

        # Send invalid message (wrong type)
        ws.send_text('{"type": "invalid_type"}')
        error_data2 = ws.receive_text()
        error_message2 = json.loads(error_data2)
        assert error_message2["type"] == "error"

        # Send valid ping message after error
        ws.send_text('{"type": "ping"}')
        state_data = ws.receive_text()
        state_message = json.loads(state_data)
        assert state_message["type"] == "state_update"

    tmp.close()


def test_ws_mouse_position_message():
    """Test WebSocket mouse position message handling"""
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)

    with client.websocket_connect(f"/ws/game/{session_id}") as ws:
        # Receive initial state
        data = ws.receive_text()
        message = json.loads(data)
        assert message["type"] == "state_update"

        # Send mouse position message
        mouse_msg = {"type": "mouse_position", "user_id": user_id, "x": 150.5, "y": 200.7}
        ws.send_text(json.dumps(mouse_msg))

        # Should receive mouse_cursor message (mouse position updates trigger cursor broadcast)
        cursor_data = ws.receive_text()
        cursor_message = json.loads(cursor_data)
        assert cursor_message["type"] == "mouse_cursor"
        assert cursor_message["data"]["user_id"] == user_id
        assert cursor_message["data"]["x"] == 150.5
        assert cursor_message["data"]["y"] == 200.7

    tmp.close()


def test_ws_puzzle_interaction_message():
    """Test WebSocket puzzle interaction message handling"""
    client, tmp = create_test_app_and_client()
    user_id, team_id, session_id = create_team_user_session(client)

    # Create a puzzle first
    puzzle_resp = client.post(
        "/puzzle/create",
        json={"type": "memory", "game_session_id": session_id, "user_id": user_id},
    )
    puzzle = puzzle_resp.json()

    with client.websocket_connect(f"/ws/game/{session_id}") as ws:
        # Receive initial state
        data = ws.receive_text()
        message = json.loads(data)
        assert message["type"] == "state_update"

        # Send puzzle interaction message
        interaction_msg = {
            "type": "puzzle_interaction",
            "user_id": user_id,
            "puzzle_id": puzzle["id"],
            "interaction_type": "click",
            "interaction_data": {"x": 100, "y": 150},
        }
        ws.send_text(json.dumps(interaction_msg))

        # Should receive puzzle_interaction message (puzzle interactions trigger interaction broadcast)
        interaction_data = ws.receive_text()
        interaction_message = json.loads(interaction_data)
        assert interaction_message["type"] == "puzzle_interaction"
        assert interaction_message["data"]["user_id"] == user_id
        assert interaction_message["data"]["puzzle_id"] == puzzle["id"]
        assert interaction_message["data"]["interaction_type"] == "click"

    tmp.close()
