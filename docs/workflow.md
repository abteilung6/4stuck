# Backend Implementation: Puzzle & Player Points System

## Features to Add
- **Puzzle Model:** Store puzzle type, data, correct answer, and link to game session and player.
- **Player Points:** Track each player’s current points, with decay and transfer logic.
- **Endpoints:**
  - Create a puzzle for a player (random type, after each solve).
  - Get the current puzzle for a player.
  - Submit an answer to a puzzle (validate, transfer points to next player if correct).
  - Get all players’ points for a team/session.
- **Timer/Decay Logic:** (Backend-side, for now: endpoint to trigger decay for all players, or background job in production).
- **Tests:** Pytest coverage for all endpoints and edge cases.

## Optimal Structure
- `models.py`: Add `Puzzle` model, update `User` model to track points.
- `schemas.py`: Add schemas for puzzle creation, state, answer submission, and player points.
- `routers/puzzle.py`: New router for puzzle endpoints.
- `routers/points.py`: (Optional) Router for points/decay endpoints.
- `main.py`: Register new routers.
- `tests/test_puzzle_api.py`: Pytest file for puzzle endpoints and point logic.

## Implementation Plan
1. Update models and schemas.
2. Implement endpoints for puzzle flow and points.
3. Add tests for all new logic.

---

# How to Implement Real-Time Updates in FastAPI

## Best Practice: WebSockets
- Use WebSockets to push updates from the server to clients instantly (no polling).
- FastAPI has built-in support for WebSockets.
- Each team/session can have its own WebSocket “room” (channel).

## What Should Be Real-Time?
- Player points (when decayed, awarded, or a player is eliminated)
- Puzzle state (when a new puzzle is assigned, or a puzzle is solved/failed)
- Team status (who is still active, who is out)
- Game events (start, end, etc.)

## Backend Implementation Plan
1. Add a WebSocket endpoint (e.g., `/ws/game/{session_id}`).
2. Track connected clients (per session/team).
3. Broadcast updates to all clients in a session when:
   - Points change (decay, award, elimination)
   - Puzzle state changes
   - Game events occur
4. Frontend: Connect to the WebSocket and update the UI in real time.

## Caveats
- For production, use a message broker (like Redis) if you run multiple FastAPI workers, but for MVP/single-process, in-memory tracking is fine.
- WebSocket support in FastAPI is robust, but you’ll need to manage connections and broadcast logic. 

MVP WebSocket Implementation Plan
Features
One WebSocket endpoint per game session (e.g., /ws/game/{session_id})
In-memory tracking of connected clients per session
Server can broadcast updates (points, puzzle state, eliminations, etc.) to all clients in a session
Clients receive JSON messages and update their UI in real time
Limitations
Works only for a single FastAPI process (not horizontally scalable)
If the server restarts, all connections are lost (fine for MVP/dev)
Implementation Steps
Create a new router: routers/ws.py
Add a WebSocket endpoint: /ws/game/{session_id}
Track connected clients: Use a dictionary mapping session_id to a set of WebSocket connections
Broadcast function: Send a message to all clients in a session
Trigger broadcasts: When points change, puzzles are solved, or a player is eliminated, call the broadcast function

---

# Frontend Game UI Development Workflow

This document outlines the next optimal steps for building out the user-facing game interface, enabling end-to-end playtesting and a complete multiplayer experience.

## 1. Lobby & Team Management UI
- **User Registration/Login:**
  - Allow users to register or log in (if authentication is implemented).
  - Store user identity in frontend state (e.g., context or Redux).
- **Team Creation/Join:**
  - UI for creating a new team or joining an existing one.
  - Display available teams and their members (using backend API).
  - Show current user's team and roster.
- **Team State Updates:**
  - Listen for real-time updates (WebSocket) to reflect changes in team composition.

## 2. Game Session Start/Join
- **Start New Game:**
  - UI for team leader to start a new game session.
  - Option for team members to join an existing session.
- **Session Lobby:**
  - Show all teams/players in the session.
  - Indicate session status (waiting, in progress, completed).

## 3. Puzzle Display & Answer Submission
- **Current Puzzle View:**
  - Display the current puzzle for the team.
  - Input for submitting answers.
  - Show feedback (correct/incorrect, points awarded/lost).
- **Puzzle Progression:**
  - Indicate when a puzzle is solved and the next one appears.
  - Handle timeouts or point decay visually.

## 4. Live Game State
- **Team & Player Points:**
  - Real-time display of team and player points.
  - Visualize point decay, transfers, and eliminations.
- **Game Events:**
  - Show notifications for key events (e.g., team eliminated, puzzle solved).
- **WebSocket Integration:**
  - Use backend WebSocket to update UI instantly as state changes.

## 5. End-of-Game/Results Screen
- **Results Display:**
  - Show final standings, points, and winners.
  - Option to start a new game or return to lobby.

## 6. General UI/UX Considerations
- **Responsiveness:**
  - Ensure UI works on desktop and mobile.
- **Error Handling:**
  - Gracefully handle API/WebSocket errors and display user-friendly messages.
- **Loading States:**
  - Indicate when data is being fetched or actions are processing.

---

**Implementation Order Recommendation:**
1. Lobby & Team Management UI
2. Game Session Start/Join
3. Puzzle Display & Answer Submission
4. Live Game State
5. End-of-Game/Results Screen

This workflow will guide the next phase of development, focusing on delivering a playable and testable game experience for users.