# Team.försvarsmakten - Development TODO

## 🎯 Project Goal
Complete the Team.försvarsmakten game according to the detailed specifications in `docs/forvarsmakten-game-detailed.md`.

---

## 📋 Phase 1: Complete Game Flow Integration (Week 1)
**Priority: CRITICAL** - Must complete before moving to other phases

### Backend Tasks

#### 1.1 Fix Game State Transitions
- [ ] **Fix lobby → countdown transition**
  - [ ] Ensure game session starts in "lobby" state
  - [ ] Add endpoint to transition to "countdown" state
  - [ ] Implement proper countdown duration (5 seconds)
  - [ ] Add validation for state transitions

- [ ] **Fix countdown → active transition**
  - [ ] Ensure countdown completes properly
  - [ ] Set `started_at` timestamp when transitioning to active
  - [ ] Broadcast state change to all connected clients
  - [ ] Initialize all players with starting points (15)

- [ ] **Fix active → finished transition**
  - [ ] Improve game end detection logic
  - [ ] Ensure all players eliminated triggers game end
  - [ ] Set `ended_at` timestamp and calculate survival time
  - [ ] Broadcast final state to all clients

#### 1.2 Enhance Game End Logic
- [ ] **Improve survival time calculation**
  - [ ] Fix survival time calculation in main.py decay loop
  - [ ] Ensure accurate start/end time tracking
  - [ ] Add survival time to game session response

- [ ] **Add proper game end detection**
  - [ ] Verify all players eliminated logic works correctly
  - [ ] Add game end broadcast to WebSocket
  - [ ] Ensure game session status updates properly

#### 1.3 Backend Testing
- [ ] **Test game flow endpoints**
  - [ ] Test lobby → countdown → active → finished flow
  - [ ] Test survival time calculation
  - [ ] Test WebSocket broadcasts for each state change

### Frontend Tasks

#### 1.4 Integrate Countdown Component
- [ ] **Connect CountdownView to game flow**
  - [ ] Import and use existing CountdownView component
  - [ ] Add countdown state to game session view
  - [ ] Handle countdown completion callback
  - [ ] Transition to active game state after countdown

- [ ] **Add countdown styling**
  - [ ] Ensure CountdownView.css is properly imported
  - [ ] Test countdown display and animations
  - [ ] Verify responsive design

#### 1.5 Create Results Screen
- [ ] **Build GameResultsView component**
  - [ ] Create new component: `frontend/src/components/GameResultsView.tsx`
  - [ ] Display team survival time prominently
  - [ ] Show individual player statistics
  - [ ] List puzzles solved per player
  - [ ] Show points given/received per player

- [ ] **Add "Play Again" functionality**
  - [ ] Add button to restart game session
  - [ ] Reset all player points to starting values
  - [ ] Clear previous game data
  - [ ] Return to lobby state

#### 1.6 Fix Game State Machine
- [ ] **Update GameSessionView routing**
  - [ ] Add countdown state handling
  - [ ] Add results state handling
  - [ ] Ensure proper state transitions
  - [ ] Add loading states for transitions

- [ ] **Update useGameLogic hook**
  - [ ] Add countdown state support
  - [ ] Add results state support
  - [ ] Handle game end state properly
  - [ ] Update WebSocket callbacks for new states

#### 1.7 Frontend Testing
- [ ] **Test complete game flow**
  - [ ] Test lobby → countdown → active → results flow
  - [ ] Test countdown timer and completion
  - [ ] Test results display and play again
  - [ ] Test WebSocket updates during flow

---

## 📋 Phase 2: Missing Puzzle Types (Week 2)
**Priority: HIGH** - Core game functionality

### Backend Tasks

#### 2.1 Implement Spatial Puzzle
- [ ] **Add spatial puzzle generation**
  - [ ] Create `generate_spatial_puzzle()` function in `backend/app/routers/puzzle.py`
  - [ ] Generate path with obstacles (orange circles)
  - [ ] Create start and end positions
  - [ ] Return drag coordinates and obstacle positions
  - [ ] Add validation for path completion

- [ ] **Update puzzle creation endpoint**
  - [ ] Add "spatial" to supported puzzle types
  - [ ] Test spatial puzzle generation
  - [ ] Ensure proper data structure

#### 2.2 Implement Concentration Puzzle
- [ ] **Add concentration puzzle generation**
  - [ ] Create `generate_concentration_puzzle()` function
  - [ ] Generate color-word mismatches (e.g., "red" text in blue color)
  - [ ] Create multiple trials with correct/incorrect matches
  - [ ] Return text, color, and correct answer
  - [ ] Add timing for click validation

- [ ] **Update puzzle creation endpoint**
  - [ ] Add "concentration" to supported puzzle types
  - [ ] Test concentration puzzle generation
  - [ ] Ensure proper data structure

#### 2.3 Implement Multitasking Puzzle
- [ ] **Add multitasking puzzle generation**
  - [ ] Create `generate_multitasking_puzzle()` function
  - [ ] Generate number grid (e.g., 3x3 grid with numbers)
  - [ ] Create multiple tasks (find 6, find numbers in order)
  - [ ] Return grid and task instructions
  - [ ] Add validation for multiple correct answers

- [ ] **Update puzzle creation endpoint**
  - [ ] Add "multitasking" to supported puzzle types
  - [ ] Test multitasking puzzle generation
  - [ ] Ensure proper data structure

### Frontend Tasks

#### 2.4 Create Spatial Puzzle Component
- [ ] **Build SpatialPuzzle component**
  - [ ] Create `frontend/src/components/puzzles/SpatialPuzzle.tsx`
  - [ ] Implement draggable circle using react-draggable
  - [ ] Add obstacle collision detection
  - [ ] Add path completion validation
  - [ ] Add visual feedback for collisions

- [ ] **Add spatial puzzle styling**
  - [ ] Create `SpatialPuzzle.css` for styling
  - [ ] Style draggable circle and obstacles
  - [ ] Add visual feedback animations
  - [ ] Ensure responsive design

#### 2.5 Create Concentration Puzzle Component
- [ ] **Build ConcentrationPuzzle component**
  - [ ] Create `frontend/src/components/puzzles/ConcentrationPuzzle.tsx`
  - [ ] Display color-word combinations
  - [ ] Implement click validation logic
  - [ ] Add visual feedback for correct/incorrect clicks
  - [ ] Add timing for response validation

- [ ] **Add concentration puzzle styling**
  - [ ] Create `ConcentrationPuzzle.css` for styling
  - [ ] Style color-word display
  - [ ] Add visual feedback animations
  - [ ] Ensure accessibility (color contrast)

#### 2.6 Create Multitasking Puzzle Component
- [ ] **Build MultitaskingPuzzle component**
  - [ ] Create `frontend/src/components/puzzles/MultitaskingPuzzle.tsx`
  - [ ] Display number grid
  - [ ] Implement multiple task handling
  - [ ] Add visual search functionality
  - [ ] Add progress tracking for multiple tasks

- [ ] **Add multitasking puzzle styling**
  - [ ] Create `MultitaskingPuzzle.css` for styling
  - [ ] Style number grid layout
  - [ ] Add visual feedback for selections
  - [ ] Ensure clear task instructions

#### 2.7 Update Puzzle Renderer
- [ ] **Add new puzzle types to renderer**
  - [ ] Update `PuzzleRenderer.tsx` to handle new puzzle types
  - [ ] Add case statements for "spatial", "concentration", "multitasking"
  - [ ] Import new puzzle components
  - [ ] Test all puzzle type rendering

#### 2.8 Frontend Testing
- [ ] **Test new puzzle components**
  - [ ] Test spatial puzzle drag functionality
  - [ ] Test concentration puzzle click validation
  - [ ] Test multitasking puzzle multiple tasks
  - [ ] Test puzzle type switching

---

## 📋 Phase 3: Visual Design & UI Polish (Week 3)
**Priority: MEDIUM** - User experience improvements

### Frontend Tasks

#### 3.1 Match Design Assets
- [ ] **Implement design from screenshots**
  - [ ] Analyze screenshots in `docs/images/`
  - [ ] Update color scheme to match design
  - [ ] Implement proper typography
  - [ ] Add game title and branding

- [ ] **Create responsive layout**
  - [ ] Ensure mobile-friendly design
  - [ ] Test on different screen sizes
  - [ ] Add proper breakpoints
  - [ ] Optimize for tablet and desktop

#### 3.2 Add Animations & Transitions
- [ ] **Implement smooth state transitions**
  - [ ] Add CSS transitions between game states
  - [ ] Implement fade in/out animations
  - [ ] Add loading animations
  - [ ] Smooth puzzle transitions

- [ ] **Add puzzle completion animations**
  - [ ] Success animation for correct answers
  - [ ] Failure animation for incorrect answers
  - [ ] Point transfer visual feedback
  - [ ] Player elimination animations

#### 3.3 Enhance Team Coordination UI
- [ ] **Add visual indicators for point transfers**
  - [ ] Show who received points from whom
  - [ ] Add point transfer animations
  - [ ] Display point transfer history
  - [ ] Visual feedback for team coordination

- [ ] **Add player status indicators**
  - [ ] Show active/eliminated status
  - [ ] Add ready/not ready indicators
  - [ ] Display current puzzle type per player
  - [ ] Show player performance indicators

#### 3.4 Improve Accessibility
- [ ] **Add high contrast design**
  - [ ] Ensure sufficient color contrast
  - [ ] Add focus indicators
  - [ ] Support for screen readers
  - [ ] Keyboard navigation support

- [ ] **Add accessibility features**
  - [ ] ARIA labels for interactive elements
  - [ ] Alt text for images
  - [ ] Semantic HTML structure
  - [ ] Voice command support (optional)

---

## 📋 Phase 4: Enhanced Features (Week 4)
**Priority: MEDIUM** - Additional functionality

### Backend Tasks

#### 4.1 Add Player Statistics
- [ ] **Track player performance**
  - [ ] Add statistics fields to User model
  - [ ] Track puzzles solved per player
  - [ ] Calculate individual performance metrics
  - [ ] Store historical data

- [ ] **Add statistics endpoints**
  - [ ] Create endpoint for player statistics
  - [ ] Create endpoint for team statistics
  - [ ] Add historical performance data
  - [ ] Calculate averages and rankings

#### 4.2 Implement Leaderboards
- [ ] **Create leaderboard system**
  - [ ] Add leaderboard model/table
  - [ ] Track team survival times
  - [ ] Track individual performance
  - [ ] Calculate rankings

- [ ] **Add leaderboard endpoints**
  - [ ] Create endpoint for team leaderboards
  - [ ] Create endpoint for individual leaderboards
  - [ ] Add historical best times
  - [ ] Add filtering and sorting options

### Frontend Tasks

#### 4.3 Add Statistics Display
- [ ] **Create statistics components**
  - [ ] Build PlayerStats component
  - [ ] Build TeamStats component
  - [ ] Display individual performance metrics
  - [ ] Show historical data

- [ ] **Add leaderboard display**
  - [ ] Create Leaderboard component
  - [ ] Display team rankings
  - [ ] Display individual rankings
  - [ ] Add achievement indicators

#### 4.4 Create Settings/Configuration
- [ ] **Add game configuration**
  - [ ] Create Settings component
  - [ ] Add adjustable game parameters
  - [ ] Allow team size configuration
  - [ ] Add difficulty settings

- [ ] **Implement configuration storage**
  - [ ] Store user preferences
  - [ ] Save game settings
  - [ ] Load default configurations
  - [ ] Validate configuration options

---

## 📋 Phase 5: Testing & Polish (Week 5)
**Priority: MEDIUM** - Quality assurance

### Testing Tasks

#### 5.1 End-to-End Testing
- [ ] **Test complete game flow**
  - [ ] Test lobby → countdown → active → results flow
  - [ ] Test all puzzle types
  - [ ] Test multiplayer scenarios
  - [ ] Test edge cases and error handling

- [ ] **Test multiplayer functionality**
  - [ ] Test with multiple players
  - [ ] Test WebSocket connections
  - [ ] Test real-time updates
  - [ ] Test team coordination

#### 5.2 Performance Testing
- [ ] **Test WebSocket performance**
  - [ ] Test connection stability
  - [ ] Test message delivery
  - [ ] Test reconnection handling
  - [ ] Test with multiple concurrent users

- [ ] **Test database performance**
  - [ ] Test query performance
  - [ ] Test concurrent database access
  - [ ] Test data consistency
  - [ ] Optimize slow queries

#### 5.3 User Experience Testing
- [ ] **Conduct usability testing**
  - [ ] Test with real users
  - [ ] Gather feedback on UI/UX
  - [ ] Identify pain points
  - [ ] Test accessibility features

- [ ] **Cross-browser compatibility**
  - [ ] Test on Chrome, Firefox, Safari, Edge
  - [ ] Test on mobile browsers
  - [ ] Test responsive design
  - [ ] Fix compatibility issues

### Polish Tasks

#### 5.4 Bug Fixes
- [ ] **Address discovered issues**
  - [ ] Fix any bugs found during testing
  - [ ] Address performance issues
  - [ ] Fix UI/UX problems
  - [ ] Resolve accessibility issues

- [ ] **Code cleanup**
  - [ ] Refactor messy code
  - [ ] Remove unused code
  - [ ] Improve code documentation
  - [ ] Optimize performance

#### 5.5 Documentation
- [ ] **Complete API documentation**
  - [ ] Document all endpoints
  - [ ] Add request/response examples
  - [ ] Document error codes
  - [ ] Add usage examples

- [ ] **Create user documentation**
  - [ ] Write user guide
  - [ ] Create deployment instructions
  - [ ] Add troubleshooting guide
  - [ ] Document configuration options

---

## 🚀 Quick Start Checklist

### Before Starting Development:
- [ ] Review `docs/forvarsmakten-game-detailed.md` for complete requirements
- [ ] Examine screenshots in `docs/images/` for visual reference
- [ ] Watch video in `docs/videos/` for gameplay flow
- [ ] Set up development environment (backend + frontend)
- [ ] Run existing tests to ensure current functionality works

### Phase 1 Priority Order:
1. **Fix backend game state transitions** (1.1)
2. **Integrate countdown component** (1.4)
3. **Create results screen** (1.5)
4. **Fix game state machine** (1.6)
5. **Test complete flow** (1.7)

### Success Criteria for Phase 1:
- [ ] Complete game flow works: Lobby → Countdown → Active → Results
- [ ] Countdown component is properly integrated
- [ ] Results screen displays survival time and stats
- [ ] Game state transitions are smooth
- [ ] All tests pass

---

## 📝 Notes

- **Focus on Phase 1 first** - This is critical for the game to be playable
- **Test frequently** - Each task should be tested before moving to the next
- **Keep it simple** - Don't over-engineer solutions in early phases
- **Document changes** - Update documentation as you implement features
- **Ask for help** - If stuck on a task, ask for clarification or assistance

---

## 🔄 Daily Progress Tracking

### Day 1:
- [ ] Task completed:
- [ ] Issues encountered:
- [ ] Next day plan:

### Day 2:
- [ ] Task completed:
- [ ] Issues encountered:
- [ ] Next day plan:

### Day 3:
- [ ] Task completed:
- [ ] Issues encountered:
- [ ] Next day plan:

### Day 4:
- [ ] Task completed:
- [ ] Issues encountered:
- [ ] Next day plan:

### Day 5:
- [ ] Task completed:
- [ ] Issues encountered:
- [ ] Next week plan: 