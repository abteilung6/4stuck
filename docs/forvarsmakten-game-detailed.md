# Team.försvarsmakten: Detailed Game Design & Flow

## Overview
Team.försvarsmakten is a collaborative, team-based cognitive puzzle game inspired by Swedish military training principles. The game emphasizes teamwork, cognitive skills, and stress management under time pressure. Players must rely on each other to survive and maximize their team score.

---

## 1. Game Structure
- **Teams:** 4 players per team (configurable).
- **Objective:** Survive as long as possible by solving puzzles and supporting teammates. The game continues indefinitely until all players are eliminated.
- **Play Mode:** All players play simultaneously; no turn order.
- **Session Flow:** Lobby → Countdown → Active Gameplay → Results.

---

## 2. Game Flow & UI

### A. Lobby/Team Formation
- Players join a team lobby, see each other’s names/avatars.
- UI displays team list, game title, and a “Ready” or “Start” button.
- Once all players are ready, a countdown begins.

### B. Countdown/Preparation
- Short countdown (e.g., 5 seconds) before the game starts.
- UI shows a timer and motivational message or rules summary.

### C. Active Gameplay
- Each player receives a randomly assigned puzzle (one of several types).
- UI displays:
  - Puzzle area (interactive component)
  - Player’s current points
  - All team members’ points (live updating)
  - Timer (for point decay and/or puzzle time limit)
  - Indicator of who solved last and who received points
- **Point Decay:** Every 5 seconds, each player loses 1 point automatically.
- **Solving Puzzles:**
  - When a player solves a puzzle, the next player in the team (round-robin) receives 5 points.
  - The solver does not receive points for themselves.
  - Incorrect attempts: no points transferred, player continues to lose points.
- **Elimination:**
  - If a player’s points reach zero, they are out and cannot play further puzzles.
  - Their UI is disabled for puzzles, but they can still see team progress.
- **Puzzle Rotation:**
  - After solving, the player immediately receives a new, randomly selected puzzle.

### D. Results/End Screen
- Game ends when all players are eliminated (reach 0 points).
- UI displays:
  - Team survival time (how long the team lasted)
  - Individual stats (puzzles solved, points given/received, time survived)
  - Option to play again or return to lobby

---

## 3. Core Game Rules & Parameters
| Rule/Parameter         | Value (Configurable)         |
|-----------------------|-----------------------------|
| Starting Points       | 15                          |
| Point Decay Interval  | 5 seconds                   |
| Points Lost per Decay | 1                           |
| Award for Solving     | 5 (to next player)          |
| Revive Mechanic       | None                        |
| Play Mode             | All players simultaneous    |
| Puzzle Assignment     | Random after each solve     |
| Goal                  | Survive as long as possible (time-based) |

---

## 4. Puzzle Types & Mechanics

### 1. Memory Puzzle (Color-Number Association)
- Sequence of colored circles, each mapped to a number.
- Sequence disappears after a short time.
- Player is asked: “Which color was associated with number X?”
- Must recall and select the correct color.
- **Skills:** Short-term memory, attention.

### 2. Spatial/Path Puzzle (Drag the Circle)
- Player must drag a circle from one side to the other.
- Path contains orange obstacles; cannot touch them.
- **Skills:** Spatial reasoning, fine motor control, planning.

### 3. Concentration/Matching Puzzle (Color-Word Match)
- Color name is displayed as text, and a colored circle is shown.
- Click the circle only when the text matches the circle’s color.
- **Skills:** Concentration, inhibition, pattern recognition.

### 4. Multitasking/Combined Puzzle (Find Numbers)
- Grid or sequence of numbers is shown.
- Task: Find and click on the number six, or all numbers in order as prompted.
- May be combined with other tasks, requiring focus switching.
- **Skills:** Multitasking, visual search, adaptability.

---

## 5. Player Experience & Visuals
- **Lobby:** Team list, avatars, ready status, game title.
- **Countdown:** Large timer, motivational or instructional text.
- **Gameplay:**
  - Puzzle area is central and interactive.
  - Points for all players are always visible.
  - Clear feedback for correct/incorrect answers and point transfers.
  - Disabled UI for eliminated players.
- **Results:**
  - Team and individual stats, summary of performance.
  - Option to replay or return to lobby.

---

## 6. Teamwork & Strategy
- Players must encourage and support each other.
- Success depends on teammates solving puzzles to keep everyone alive.
- No one can “save themselves”; all progress is interdependent.
- Teams must coordinate to maximize survival and score.

---

## 7. Technical Implementation Notes
- **Real-time updates:** WebSocket or similar for live point/status updates.
- **Configurable parameters:** All point values, timers, and team size should be easily adjustable.
- **Extensible puzzle system:** New puzzle types can be added modularly.
- **Accessibility:** UI should be clear, high-contrast, and responsive.

---

## 8. Example Game Session
1. Players join the lobby, see each other, and ready up.
2. Countdown begins; rules are briefly shown.
3. Game starts: each player receives a puzzle, points start decaying.
4. Alice solves a puzzle; Bob receives 5 points.
5. Carol fails a puzzle; no points transferred, she continues losing points.
6. Dave’s points reach zero; he is eliminated, UI disables his puzzle area.
7. Game continues indefinitely until all players are eliminated (reach 0 points).
8. Results screen shows team survival time and individual stats, with option to replay.

---

## 9. Visual References
- See `docs/images/` for screenshots of each game phase.
- See extracted video frames for real gameplay flow.

---

## 10. Summary
Team.försvarsmakten is a unique, team-based cognitive challenge that rewards collaboration, quick thinking, and mutual support. Its design ensures that no player can succeed alone, making it a powerful tool for team-building and cognitive training. 