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

---

# Start Game Session from Lobby: Detailed Breakdown

## Overview
Enables teams to transition from the lobby/team management phase into active gameplay by starting a game session. This is a critical step for enabling end-to-end playtesting and unlocking the puzzle/game UI.

## Backend Steps
1. **Endpoint Review**
   - Confirm existence of an endpoint to start a game session (e.g., `POST /game/session`).
   - Confirm required request body (e.g., team_id) and response (e.g., session info).
2. **Permissions/Logic**
   - Optionally restrict session start to team leader or allow any member (MVP: any member).
   - Ensure a team cannot start multiple concurrent sessions.
3. **Testing**
   - Add/verify tests for session creation, duplicate prevention, and error handling.

## Frontend Steps
1. **UI Update**
   - Add a “Start Game” button to the lobby/team view (visible if user is in a team and no session is active).
   - Disable or hide the button if a session is already active for the team.
2. **API Integration**
   - On click, call the backend endpoint to start a session for the current team.
   - Handle loading, success, and error states.
3. **State Management**
   - Store the session info in frontend state/context for use in the puzzle/game UI.
   - Transition UI to the game/puzzle view when the session starts.
4. **Feedback**
   - Show confirmation, errors, or session status to the user.

## Implementation Order Recommendation
1. Backend: Confirm/implement endpoint and tests.
2. Frontend: Add button, integrate API, handle state/transition.

---

This breakdown guides the implementation of the game session start feature, bridging the lobby and gameplay phases for a seamless user experience.

---

# Puzzle/Game UI After Session Start: Detailed Breakdown

## Overview
After a game session is started, the UI transitions from the lobby to the puzzle/game view. This component is responsible for presenting puzzles, handling answer submission, showing feedback, and updating in real time as the game progresses.

## Backend Steps
1. **Endpoint Review**
   - Confirm endpoints for fetching the current puzzle (e.g., `GET /puzzle/state/{user_id}` or similar).
   - Confirm endpoint for submitting an answer (e.g., `POST /puzzle/answer`).
   - Confirm real-time update mechanism (WebSocket or polling).
2. **Testing**
   - Ensure endpoints are covered by tests for puzzle retrieval, answer validation, and state updates.

## Frontend Steps
1. **Component Structure**
   - Create a new component (e.g., `GameSessionView` or `PuzzleUI`).
   - Accept session info and user/team context as props or from global state.
2. **Puzzle Fetching**
   - On mount, fetch the current puzzle for the user/team.
   - Display puzzle data (type, content, etc.).
3. **Answer Submission**
   - Provide input(s) for the user to submit an answer.
   - On submit, call the backend answer endpoint and handle the response.
   - Show feedback (correct/incorrect, points awarded/lost, etc.).
4. **Real-Time Updates**
   - Integrate with the backend WebSocket (or polling) to receive live updates (e.g., puzzle solved, points changed, team eliminated).
   - Update the UI in response to real-time events.
5. **State Management & Navigation**
   - Handle transitions between puzzles, end-of-game, or elimination states.
   - Optionally, allow navigation back to the lobby or results screen.
6. **Error Handling & Loading States**
   - Show loading indicators and user-friendly error messages as needed.

## Implementation Order Recommendation
1. Backend: Confirm/implement endpoints and tests.
2. Frontend: Scaffold component, integrate puzzle fetching and answer submission.
3. Frontend: Add real-time updates and state transitions.

---

This breakdown guides the implementation of the puzzle/game UI, enabling a seamless and interactive gameplay experience after session start.