# Team.försvarsmakten - Development TODO

## 🎯 Project Goal
Complete the Team.försvarsmakten game according to the detailed specifications in `docs/forvarsmakten-game-detailed.md`.

---

## 📋 Phase 1: Complete Game Flow Integration (Week 1)
**Priority: CRITICAL** - Must complete before moving to other phases

### Backend Tasks

#### 1.1 Fix Game State Transitions
- [x] **Fix lobby → countdown transition**
  - [x] Ensure game session starts in "lobby" state
  - [x] Add endpoint to transition to "countdown" state
  - [x] Implement proper countdown duration (5 seconds)
  - [x] Add validation for state transitions

- [x] **Fix countdown → active transition**
  - [x] Ensure countdown completes properly
  - [x] Set `started_at` timestamp when transitioning to active
  - [x] Broadcast state change to all connected clients
  - [x] Initialize all players with starting points (15)

- [x] **Fix active → finished transition**
  - [x] Improve game end detection logic
  - [x] Ensure all players eliminated triggers game end
  - [x] Set `ended_at` timestamp and calculate survival time
  - [x] Broadcast final state to all clients

#### 1.2 Enhance Game End Logic
- [x] **Improve survival time calculation**
  - [x] Fix survival time calculation in main.py decay loop
  - [x] Ensure accurate start/end time tracking
  - [x] Add survival time to game session response

- [x] **Add proper game end detection**
  - [x] Verify all players eliminated logic works correctly
  - [x] Add game end broadcast to WebSocket
  - [x] Ensure game session status updates properly

#### 1.3 Backend Testing
- [ ] **Test game flow endpoints**
  - [ ] Test lobby → countdown → active → finished flow
  - [ ] Test survival time calculation
  - [ ] Test WebSocket broadcasts for each state change

### Frontend Tasks

#### 1.4 Integrate Countdown Component
- [x] **Connect CountdownView to game flow**
  - [x] Import and use existing CountdownView component
  - [x] Add countdown state to game session view
  - [x] Handle countdown completion callback
  - [x] Transition to active game state after countdown

- [x] **Add countdown styling**
  - [x] Ensure CountdownView.css is properly imported
  - [x] Test countdown display and animations
  - [x] Verify responsive design

#### 1.5 Create Results Screen
- [x] **Build GameResultsView component**
  - [x] Create new component: `frontend/src/components/GameResultsView.tsx`
  - [x] Display team survival time prominently
  - [x] Show individual player statistics
  - [x] List puzzles solved per player
  - [x] Show points given/received per player

- [x] **Add "Play Again" functionality**
  - [x] Add button to restart game session
  - [x] Reset all player points to starting values
  - [x] Clear previous game data
  - [x] Return to lobby state

#### 1.6 Fix Game State Machine
- [x] **Update GameSessionView routing**
  - [x] Add countdown state handling
  - [x] Add results state handling
  - [x] Ensure proper state transitions
  - [x] Add loading states for transitions

- [x] **Update useGameLogic hook**
  - [x] Add countdown state support
  - [x] Add results state support
  - [x] Handle game end state properly
  - [x] Update WebSocket callbacks for new states

#### 1.7 Frontend Testing
- [x] **Test complete game flow**
  - [x] Test lobby → countdown → active → results flow
  - [x] Test countdown timer and completion
  - [x] Test results display and play again
  - [x] Test WebSocket updates during flow

---

## 📋 Phase 2: Missing Puzzle Types (Week 2)
**Priority: HIGH** - Core game functionality

### Backend Tasks

#### 2.1 Implement Spatial Puzzle
- [x] **Add spatial puzzle generation**
  - [x] Create `generate_spatial_puzzle()` function in `backend/app/routers/puzzle.py`
  - [x] Generate path with obstacles (orange circles)
  - [x] Create start and end positions
  - [x] Return drag coordinates and obstacle positions
  - [x] Add validation for path completion

- [x] **Update puzzle creation endpoint**
  - [x] Add "spatial" to supported puzzle types
  - [x] Test spatial puzzle generation
  - [x] Ensure proper data structure

#### 2.2 Implement Concentration Puzzle
- [x] **Add concentration puzzle generation**
  - [x] Create `generate_concentration_puzzle()` function that generates a sequence of N color-word pairs (e.g., 10), only one of which is a correct match (text matches color).
  - [x] Store the index of the correct pair as the correct answer.
  - [x] Return the list of pairs and the correct index in the puzzle data.
  - [x] Add validation for answer: player must click at the correct time (index), otherwise fail.

- [x] **Update puzzle creation endpoint**
  - [x] Add "concentration" to supported puzzle types
  - [x] Test concentration puzzle generation
  - [x] Ensure proper data structure (sequence, correct index, etc.)

#### 2.3 Implement Multitasking Puzzle
- [x] **Add multitasking puzzle support**
  - [x] Add "multitasking" to supported puzzle types in backend
  - [x] Return basic puzzle configuration (rows, digits per row, time limit)
  - [x] Frontend will handle grid generation and 6 positioning
  - [x] No complex backend validation needed (frontend tracks clicks)

- [x] **Update puzzle creation endpoint**
  - [x] Add "multitasking" to supported puzzle types
  - [x] Return simple configuration object
  - [x] Ensure proper data structure for frontend consumption

### Frontend Tasks

#### 2.4 Create Spatial Puzzle Component
- [x] **Build SpatialPuzzle component**
  - [x] Create `frontend/src/components/puzzles/SpatialPuzzle.tsx`
  - [x] Implement draggable circle using react-draggable
  - [x] Add obstacle collision detection
  - [x] Add path completion validation
  - [x] Add visual feedback for collisions

- [x] **Add spatial puzzle styling**
  - [x] Create `SpatialPuzzle.css` for styling
  - [x] Style draggable circle and obstacles
  - [x] Add visual feedback animations
  - [x] Ensure responsive design

#### 2.5 Create Concentration Puzzle Component
- [x] **Build ConcentrationPuzzle component**
  - [x] Display a sequence of color-word pairs, each for 2 seconds
  - [x] Allow player to click the circle at any time
  - [x] If player clicks at the correct time (on the matching pair), solve the puzzle
  - [x] If player clicks at the wrong time or never clicks, fail the puzzle
  - [x] Add visual feedback for correct/incorrect clicks
  - [x] Add timing for response validation

- [x] **Add concentration puzzle styling**
  - [x] Create `ConcentrationPuzzle.css` for styling
  - [x] Style color-word display
  - [x] Add visual feedback animations
  - [x] Ensure accessibility (color contrast)

#### 2.6 Create Multitasking Puzzle Component
- [x] **Build MultitaskingPuzzle component**
  - [x] Create `frontend/src/components/puzzles/MultitaskingPuzzle.tsx`
  - [x] Generate grid with 3-4 rows of 9-digit numbers (one 6 per row, randomly positioned)
  - [x] Display number grid in a clean layout
  - [x] Implement click detection on individual digits
  - [x] Highlight found 6s in red when clicked
  - [x] Add progress tracking with illuminated dots
  - [x] Implement 10-second time limit with countdown
  - [x] Track completion when all 6s are found and submit answer

- [x] **Add multitasking puzzle styling**
  - [x] Create `MultitaskingPuzzle.css` for styling
  - [x] Style number grid with proper spacing and typography
  - [x] Add visual feedback for found 6s (red highlighting)
  - [x] Style progress dots and timer display
  - [x] Ensure clear task instructions and accessibility

#### 2.7 Update Puzzle Renderer
- [x] **Add new puzzle types to renderer**
  - [x] Update `PuzzleRenderer.tsx` to handle new puzzle types
  - [x] Add case statements for "spatial", "concentration", "multitasking"
  - [x] Import new puzzle components
  - [x] Test all puzzle type rendering

#### 2.8 Frontend Testing
- [x] **Test new puzzle components**
  - [x] Test spatial puzzle drag functionality
  - [x] Test concentration puzzle click validation
  - [x] Test multitasking puzzle multiple tasks
  - [x] Test puzzle type switching

---

## 📋 Phase 3: Visual Design & UI Polish (Week 3)
**Priority: MEDIUM** - User experience improvements

### Backend Tasks

#### 3.1 Enhanced WebSocket Support
- [ ] **Extend WebSocket message types**
  - [ ] Add mouse position broadcasting
  - [ ] Add puzzle interaction events
  - [ ] Add player activity status updates
  - [ ] Add team communication events

- [ ] **Implement real-time player tracking**
  - [ ] Track mouse movements and clicks
  - [ ] Monitor puzzle interaction patterns
  - [ ] Track player focus and attention areas
  - [ ] Store temporary player activity data

- [ ] **Add collaborative game state**
  - [ ] Share puzzle progress across team
  - [ ] Broadcast teammate achievements
  - [ ] Sync team strategy indicators
  - [ ] Handle spectator mode data

### Frontend Tasks

#### 3.2 Match Design Assets
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

#### 3.3 Add Animations & Transitions
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

#### 3.4 Enhance Team Coordination UI
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

#### 3.5 Real-Time Multiplayer Features
- [ ] **Implement real-time player activity visualization**
  - [ ] Show mouse cursor positions of other players in real-time
  - [ ] Display which puzzle each teammate is currently solving
  - [ ] Show real-time progress indicators for each player's current puzzle
  - [ ] Add visual feedback when teammates solve puzzles

- [ ] **Add collaborative puzzle elements**
  - [ ] Show teammate interactions with puzzle elements (clicks, drags, etc.)
  - [ ] Display shared puzzle state when applicable
  - [ ] Add visual indicators for teammate focus/attention areas
  - [ ] Show real-time puzzle completion progress across team

- [ ] **Implement team communication features**
  - [ ] Add simple emoji reactions for team coordination
  - [ ] Show "player is thinking" indicators
  - [ ] Display teammate stress/performance indicators
  - [ ] Add visual cues for team strategy coordination

- [ ] **Add spectator mode for eliminated players**
  - [ ] Allow eliminated players to watch remaining teammates
  - [ ] Show eliminated player's view of active gameplay
  - [ ] Add cheering/encouragement features for eliminated players
  - [ ] Display team survival statistics in real-time

#### 3.6 Game Layout & Multiplayer UI
- [ ] **Implement 4-player grid layout**
  - [ ] Create 2x2 grid layout for 4 players (like original game)
  - [ ] Each player gets their own puzzle area/quadrant
  - [ ] Show individual player life bars under each quadrant
  - [ ] Display player colors/identifiers consistently

- [ ] **Add player color assignment system**
  - [ ] Assign unique colors to each player (yellow, red, blue, green)
  - [ ] Show color-coded mouse cursors for each player
  - [ ] Display player colors in team list and game UI
  - [ ] Maintain color consistency throughout the game session

- [ ] **Implement "AWAITING PARTICIPANTS" system**
  - [ ] Show waiting message when team is incomplete
  - [ ] Display countdown for auto-start when team is full
  - [ ] Add invite link sharing functionality
  - [ ] Show real-time player join/leave notifications

- [ ] **Add voice/audio feedback system**
  - [ ] Implement metallic voice announcements
  - [ ] Add audio cues for puzzle instructions
  - [ ] Include sound effects for point transfers
  - [ ] Add audio feedback for game state changes

#### 3.7 Improve Accessibility
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

#### 3.8 Performance & Average Comparison
- [ ] **Implement performance benchmarking**
  - [ ] Calculate and display team performance vs average
  - [ ] Show "below average" / "above average" indicators
  - [ ] Store historical performance data
  - [ ] Display percentile rankings

- [ ] **Add performance feedback system**
  - [ ] Show motivational messages based on performance
  - [ ] Display improvement suggestions
  - [ ] Add performance trends over time
  - [ ] Include team vs individual performance metrics

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

### Phase 2 Priority Order:
1. ✅ **Implement all puzzle types** (2.1-2.3)
2. ✅ **Create puzzle components** (2.4-2.6)
3. ✅ **Update puzzle renderer** (2.7)
4. ✅ **Test all components** (2.8)

### Success Criteria for Phase 2:
- ✅ All puzzle types working: memory, text, multiple choice, spatial, concentration, multitasking
- ✅ Frontend components properly styled and responsive
- ✅ Backend supports all puzzle types
- ✅ Game flow works with puzzle rotation
- ✅ All tests pass (59/59 tests passing)

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
- [x] Task completed: 1.1.1 - Ensure game session starts in "lobby" state
- [x] Task completed: 1.1.2 - Add endpoint to transition to "countdown" state (with strict validation and tests)
- [x] Issues encountered: None - task was already correctly implemented, validation and tests improved
- [x] Next day plan: Continue with task 1.1.3 - Implement proper countdown duration (5 seconds)

### Day 2:
- [x] Task completed: 1.1.3 - Implement proper countdown duration (5 seconds)
- [x] Task completed: 1.1.4 - Add validation for state transitions
- [x] Task completed: 1.1 - Fix lobby → countdown transition (all subtasks)
- [x] Task completed: 1.2 - Fix countdown → active transition (all subtasks)
- [x] Issues encountered: None - all backend state transitions working correctly
- [x] Next day plan: Continue with task 1.3 - Fix active → finished transition (game end detection)

### Day 3:
- [x] Task completed: 1.3 - Fix active → finished transition (all subtasks)
- [x] Task completed: 1.2 - Enhance game end logic (all subtasks)
- [x] Issues encountered: Test bug (username uniqueness) and missing db.commit in service; both fixed
- [x] Next day plan: Continue with frontend integration (countdown, results screen) and full flow testing

### Day 4:
- [x] Task completed: 1.4 - Integrate Countdown Component (all subtasks)
- [x] Task completed: 1.5 - Create Results Screen (all subtasks)
- [x] Task completed: 1.6 - Fix Game State Machine (all subtasks)
- [x] Task completed: 1.7 - Frontend Testing (all subtasks) - 27/27 tests passing (100%)
- [x] Issues encountered: Fixed 2 minor test selector issues, all tests now passing perfectly
- [x] Next day plan: Phase 1 complete! Ready for Phase 2 (missing puzzle types) or deployment

### Day 5:
- [x] Task completed: 2.1 - Implement Spatial Puzzle (all subtasks) - Backend already supported spatial puzzles
- [x] Task completed: 2.4 - Create Spatial Puzzle Component (all subtasks)
- [x] Task completed: 2.7 - Update Puzzle Renderer (all subtasks)
- [x] Task completed: 2.8 - Frontend Testing (spatial puzzle and puzzle type switching)
- [x] Issues encountered: Fixed React "Maximum update depth exceeded" error in SpatialPuzzle component, refactored game loop to use refs and memoization
- [x] Next week plan: Continue with remaining puzzle types (concentration, multitasking) and backend puzzle generation

### Day 6:
- [x] Task completed: 2.2 - Implement Concentration Puzzle (all subtasks) - Backend puzzle generation and validation
- [x] Task completed: 2.5 - Create Concentration Puzzle Component (all subtasks) - Frontend component with timing and click validation
- [x] Task completed: 2.8 - Frontend Testing (concentration puzzle testing) - Component working correctly with proper answer submission
- [x] Issues encountered: Fixed race condition in answer submission by implementing submitAnswerWithAnswer function
- [x] Next week plan: Continue with multitasking puzzle implementation and visual design polish

### Day 7:
- [x] Task completed: 2.3 - Implement Multitasking Puzzle (all subtasks) - Backend support added, frontend handles grid generation
- [x] Task completed: 2.6 - Create Multitasking Puzzle Component (all subtasks) - Complete component with timer, progress tracking, and styling
- [x] Task completed: 2.8 - Frontend Testing (multitasking puzzle testing) - Component working correctly with proper answer submission
- [x] Issues encountered: None - implementation went smoothly with frontend-only grid generation approach
- [x] Next week plan: Phase 2 complete! Ready for Phase 3 (visual design polish) or deployment 