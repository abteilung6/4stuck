# Development Plan: Team.försvarsmakten Game (Fullstack)

## 1. Project Overview
Rebuild "Team.försvarsmakten" as a multiplayer, team-based puzzle game that tests memory, concentration, spatial thinking, and multitasking.

### Key Features
- Multiplayer (teams of 4)
- Real-time collaboration
- Multiple puzzle types (memory, spatial, etc.)
- Points system: points earned by one player go to teammates; failures affect the team
- Interactive UI: clickable colored circles, draggable elements

---

## 2. Tech Stack

### Backend
- FastAPI (Python): REST API, WebSocket support for real-time features
- Database: PostgreSQL (recommended), or SQLite for prototyping
- Redis: For real-time state management (optional)
- Auth: JWT-based authentication (optional for MVP)

### Frontend
- React (recommended for interactivity and component-based UI)
- TypeScript (for type safety)
- Socket.IO or native WebSockets: For real-time communication
- UI Library: Tailwind CSS, Material-UI, or Chakra UI
- State Management: React Context or Redux (for complex state)

---

## 3. System Architecture

Client (React) <-> FastAPI Backend <-> Database
                        |
                     (Redis optional)

---

## 4. Backend: FastAPI Setup

### Project Structure
backend/
  app/
    main.py
    models.py
    schemas.py
    database.py
    routers/
      auth.py
      game.py
      team.py
    services/
      game_logic.py
      team_logic.py
    utils/
  requirements.txt

### Key Components
- User/Team Management
- Game Session
- Puzzle Logic
- Real-Time Updates (WebSockets)
- Scoring System

### Example Endpoints
- POST /register
- POST /team/create
- POST /team/join
- POST /game/start
- GET /game/state
- POST /game/submit
- WebSocket /ws/game/{game_id}

---

## 5. Frontend: React Setup

### Project Structure
frontend/
  src/
    components/
      Lobby.tsx
      GameBoard.tsx
      PuzzleMemory.tsx
      PuzzleSpatial.tsx
      ScoreBoard.tsx
      TeamStatus.tsx
    hooks/
    utils/
    App.tsx
    index.tsx
  public/
  package.json
  tailwind.config.js (if using Tailwind)

### Key Features
- Lobby: Team creation/joining
- Game Board: Current puzzle, timer, team status
- Puzzle Components: Interactive UI for each puzzle type
- Scoreboard: Team and individual scores
- Real-Time Updates: WebSockets

### Example UI Libraries
- Draggable/Movable Circles: react-draggable, react-beautiful-dnd
- Clickable Circles: Custom SVG or styled divs

---

## 6. Game Logic & Puzzles

### Puzzle Types
- Memory: Sequence of colored circles
- Spatial: Move circles to match a pattern
- Concentration: Match pairs or remember positions
- Multitasking: Combine above with time pressure

### Implementation Tips
- Store puzzle state on the backend
- Send only necessary state to clients
- Validate answers server-side

---

## 7. Real-Time Multiplayer
- Use FastAPI WebSockets for updates
- Each team/game session gets a unique WebSocket channel
- Broadcast state changes to all team members

---

## 8. Points & Teamwork Logic
- Points earned by one player are added to teammates
- Mistakes can subtract from team score
- Backend enforces scoring rules

---

## 9. Development Steps

### Backend
1. Scaffold FastAPI project
2. Set up database models (User, Team, GameSession, Puzzle, Score)
3. Implement REST endpoints
4. Implement WebSocket endpoints
5. Write puzzle logic modules
6. Add scoring and team logic

### Frontend
1. Scaffold React project (with TypeScript)
2. Build lobby and team management UI
3. Build game board and puzzle UIs
4. Integrate WebSocket client
5. Implement scoring and feedback UI
6. Polish with styles and animations

---

## 10. Deployment & Testing
- Use Docker for containerization (optional)
- Write unit and integration tests
- Deploy backend (Heroku, DigitalOcean, etc.)
- Deploy frontend (Vercel, Netlify, etc.)

---

## 11. Extra Features (Optional)
- User authentication (OAuth, JWT)
- Persistent leaderboards
- Admin dashboard
- Audio cues
- Accessibility improvements

---

## 12. Resources & References
- FastAPI Docs: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/
- Socket.IO: https://socket.io/
- react-draggable: https://www.npmjs.com/package/react-draggable
- Material-UI: https://mui.com/
- Chakra UI: https://chakra-ui.com/

---

## 13. Example: Clickable & Draggable Circles in React

```jsx
// Clickable Circle
<div
  style={{
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'red',
    display: 'inline-block',
    margin: 10,
    cursor: 'pointer'
  }}
  onClick={() => handleClick('red')}
/>

// Draggable Circle (using react-draggable)
import Draggable from 'react-draggable';

<Draggable>
  <div style={{
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'blue'
  }} />
</Draggable>
```

---

## 14. Next Steps
1. Decide on the first puzzle to implement
2. Set up backend and frontend skeletons
3. Implement team and game session logic
4. Build the interactive UI for the first puzzle
5. Test multiplayer and scoring logic
6. Iterate and add more puzzles 