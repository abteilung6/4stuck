# Team.försvarsmakten: Development Plan & Current State Analysis

## 🎯 Primary Goal
Build a survival-based team puzzle game where teams compete for the longest survival time, not puzzle completion. The game continues indefinitely until all players are eliminated.

---

## 📊 Current State Analysis

### ✅ What's Already Implemented

#### Backend (FastAPI)
- **Database Models**: Complete (User, Team, GameSession, Puzzle)
- **Point System**: Basic implementation with decay logic
- **WebSocket Support**: Real-time updates via WebSocket connections
- **Puzzle System**: Multiple puzzle types (memory, text, multiple choice)
- **Point Transfer Logic**: Round-robin point distribution to next player
- **Elimination Logic**: Players with 0 points cannot submit answers
- **Automatic Point Decay**: Background thread that decays points every 5 seconds

#### Frontend (React/TypeScript)
- **API Integration**: Generated TypeScript client from OpenAPI
- **Game Session View**: Basic UI for active gameplay
- **Puzzle Components**: Renderers for different puzzle types
- **Real-time Updates**: WebSocket connection for live state updates
- **Game Logic Hooks**: Custom hooks for game state management
- **Team Points Display**: Real-time team points table

#### Testing
- **Backend Tests**: Comprehensive test coverage for API endpoints
- **Frontend Tests**: Basic test setup with Playwright

---

## 🚧 What Needs to Be Built/Improved

### 1. **Game Flow & UI States** (High Priority)

#### Missing Components:
- **Lobby/Team Formation Screen**
  - Team creation and joining UI
  - Player ready status
  - "Start Game" button
- **Countdown Screen**
  - Pre-game countdown timer
  - Rules/instructions display
- **Results/Survival Time Screen**
  - Team survival time display
  - Individual performance stats
  - "Play Again" option

#### Current Issues:
- No proper game state transitions
- Missing lobby functionality
- No countdown before game starts
- No results screen with survival time

### 2. **Survival Time Tracking** (High Priority)

#### Missing Features:
- **Game Session Duration**: Track when game started and ended
- **Survival Time Display**: Show how long the team lasted
- **Game End Detection**: Proper detection when all players are eliminated
- **Results Storage**: Save survival times for leaderboards

#### Current Issues:
- Game sessions don't track start/end times
- No survival time calculation
- Game end logic is incomplete

### 3. **Enhanced Puzzle System** (Medium Priority)

#### Missing Puzzle Types:
- **Spatial/Path Puzzle**: Drag circle avoiding obstacles
- **Concentration Puzzle**: Color-word matching
- **Multitasking Puzzle**: Number finding with multiple tasks

#### Current Issues:
- Only basic puzzle types implemented
- Missing the core puzzle types from the design
- No puzzle difficulty progression

### 4. **Real-time Game State Management** (Medium Priority)

#### Missing Features:
- **Game Status Transitions**: Lobby → Countdown → Active → Results
- **Player Status Updates**: Ready/not ready, eliminated/active
- **Team Coordination**: Visual indicators for point transfers
- **Elimination Feedback**: Clear UI when players are eliminated

#### Current Issues:
- No proper game state machine
- Missing visual feedback for team coordination
- WebSocket updates could be more comprehensive

### 5. **UI/UX Improvements** (Medium Priority)

#### Missing Features:
- **Visual Design**: Match the screenshots and video
- **Responsive Layout**: Mobile-friendly design
- **Accessibility**: High contrast, clear feedback
- **Animations**: Smooth transitions between states

#### Current Issues:
- Basic styling, doesn't match design assets
- No responsive design
- Limited visual feedback

---

## 🛠️ Implementation Plan

### Phase 1: Core Game Flow (Week 1-2)

#### Backend Tasks:
1. **Add Game Session Timing**
   ```python
   # Add to GameSession model
   started_at = Column(DateTime, default=datetime.utcnow)
   ended_at = Column(DateTime, nullable=True)
   survival_time_seconds = Column(Integer, nullable=True)
   ```

2. **Implement Game End Logic**
   ```python
   # Add to main.py or game service
   def check_game_end(session_id: int, db: Session):
       # Check if all players have 0 points
       # Set ended_at and calculate survival_time_seconds
   ```

3. **Add Game State Management**
   ```python
   # Add to GameSession model
   state = Column(String, default="lobby")  # lobby, countdown, active, finished
   ```

#### Frontend Tasks:
1. **Create Lobby Component**
   - Team creation/joining UI
   - Player ready status
   - Start game button

2. **Create Countdown Component**
   - 5-second countdown timer
   - Rules display

3. **Create Results Component**
   - Survival time display
   - Individual stats
   - Play again button

4. **Implement Game State Machine**
   - State transitions: lobby → countdown → active → results
   - Proper routing between components

### Phase 2: Enhanced Puzzles (Week 2-3)

#### Backend Tasks:
1. **Implement Spatial Puzzle**
   ```python
   def generate_spatial_puzzle():
       # Generate path with obstacles
       # Return drag coordinates and obstacle positions
   ```

2. **Implement Concentration Puzzle**
   ```python
   def generate_concentration_puzzle():
       # Generate color-word mismatches
       # Return text, color, and correct answer
   ```

3. **Implement Multitasking Puzzle**
   ```python
   def generate_multitasking_puzzle():
       # Generate number grid with multiple tasks
       # Return grid and task instructions
   ```

#### Frontend Tasks:
1. **Create Spatial Puzzle Component**
   - Draggable circle
   - Obstacle collision detection
   - Path completion validation

2. **Create Concentration Puzzle Component**
   - Color-word display
   - Click validation
   - Visual feedback

3. **Create Multitasking Puzzle Component**
   - Number grid display
   - Multiple task handling
   - Progress tracking

### Phase 3: UI/UX Polish (Week 3-4)

#### Design Tasks:
1. **Match Visual Design**
   - Implement design from screenshots
   - Use consistent color scheme
   - Add proper typography

2. **Add Animations**
   - Smooth state transitions
   - Point transfer animations
   - Elimination effects

3. **Improve Responsiveness**
   - Mobile-friendly layout
   - Touch-friendly interactions
   - Adaptive sizing

### Phase 4: Advanced Features (Week 4+)

#### Optional Enhancements:
1. **Leaderboards**
   - Store and display best survival times
   - Team rankings
   - Historical performance

2. **Customization**
   - Configurable point values
   - Adjustable decay rates
   - Team size options

3. **Analytics**
   - Player performance tracking
   - Team coordination metrics
   - Puzzle success rates

---

## 🎯 Success Metrics

### Functional Requirements:
- ✅ Complete game flow: Lobby → Countdown → Active → Results
- ✅ Survival time tracking and display
- ✅ All 4 puzzle types implemented
- ✅ Real-time team coordination
- ✅ Proper elimination mechanics

### Technical Requirements:
- ✅ Responsive, accessible UI
- ✅ Stable WebSocket connections
- ✅ Comprehensive test coverage
- ✅ Performance optimization

### User Experience:
- ✅ Intuitive team formation
- ✅ Clear game rules and feedback
- ✅ Engaging puzzle interactions
- ✅ Satisfying survival mechanics

---

## 🚀 Next Steps

1. **Start with Phase 1**: Implement core game flow and survival time tracking
2. **Focus on Backend First**: Add game state management and timing logic
3. **Build Frontend Components**: Create lobby, countdown, and results screens
4. **Test End-to-End**: Ensure complete game flow works
5. **Iterate and Polish**: Add puzzles and improve UI based on feedback

This plan will transform your current implementation into a fully functional survival-based team puzzle game that matches the design and provides an engaging team experience!
