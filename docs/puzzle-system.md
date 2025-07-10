# How the Puzzle System Works

## Game Structure
- The game is played in teams (typically 4 players).
- Each team works together to solve a series of cognitive puzzles.
- Each puzzle tests a specific skill: memory, concentration, spatial reasoning, or multitasking.
- Points are awarded to the team, not just the individual, emphasizing collaboration.

---

## Team.försvarsmakten Game Rules (Detailed)

### 1. Points System
- **Initial Points:** Each player starts with X points (e.g., 15 points).
- **Point Decay:** Every 5 seconds, each player loses 1 point automatically (timer-based decay).
- **Elimination:** If a player’s points reach zero, they can no longer participate in puzzles until they receive points from another player (in this version: no revive).

### 2. Solving Puzzles and Point Transfer
- When a player solves a puzzle:
  - That player does NOT receive points for themselves.
  - Instead, the points earned (for a correct solution) are given to the next player in the team (e.g., in a round-robin or pre-defined order).
  - Each player receives points from another player, not from themselves.
  - This creates a dependency: you need your teammates to succeed for you to keep playing.
- Incorrect or failed attempts:
  - No points are transferred, and the player continues to lose points over time.

### 3. Teamwork Emphasis
- You cannot “save yourself” by solving puzzles; you rely on your teammates to keep you in the game.
- If your teammates fail, you will eventually run out of points and be eliminated.
- Teams must coordinate and encourage each other to maximize everyone’s survival and the team’s overall score.

### 4. Game Flow
1. All players start with X points.
2. Timer starts; every 5 seconds, each player loses 1 point.
3. Players attempt to solve puzzles.
4. When a player solves a puzzle:
   - The next player in the team receives the reward points.
   - The solver’s own points do not increase.
5. If a player’s points reach zero, they are “out” and cannot play further puzzles.
6. The game continues until all puzzles are solved or all players are out.

### 5. Example (4 Players)
- **Order:** Alice → Bob → Carol → Dave → (back to Alice)
- **Alice solves a puzzle:** Bob receives the reward points.
- **Bob solves a puzzle:** Carol receives the reward points.
- **Carol solves a puzzle:** Dave receives the reward points.
- **Dave solves a puzzle:** Alice receives the reward points.

### 6. UI/UX Implications
- Each player’s current points are always visible.
- When a player is out of points, their UI is disabled for puzzles.
- There is a clear indicator of who gave points to whom.

---

## Core Game Rules (as of current design)
- **Starting Points:** Each player starts with **15 points** (configurable).
- **Point Decay:** Every **5 seconds**, each player loses **1 point** (configurable).
- **Award for Solving:** When a player solves a puzzle, the **next player** in the team receives **5 points** (configurable). The solver does not receive points for themselves.
- **Simultaneous Play:** All players play at the same time; there is no turn order or rotation. Players do not change their position/order in the team.
- **Random Puzzle Assignment:** After a player solves a puzzle, they immediately receive a new, randomly selected puzzle type.
- **Elimination:** If a player’s points reach zero, they are out and cannot play further puzzles. There is **no revival**.
- **Goal:** Survive as long as possible. The game ends when all players are out or all puzzles are completed.
- **Parameters:** All point values and timers should be easily adjustable for fine-tuning.

---

## Puzzle Types and Tasks

### 1. Memory Puzzle (Color-Number Association)
- Players are shown a sequence of colored circles, each mapped to a number.
- After a short time, the sequence disappears.
- The game asks: “Which color was associated with number X?”
- Players must recall and select the correct color for the given number.
- **Skills tested:** Short-term memory, attention.

### 2. Spatial/Path Puzzle (Drag the Circle)
- Players must drag a circle from one side to the other.
- The path contains orange obstacles; players are not allowed to hit the orange objects.
- **Skills tested:** Spatial reasoning, fine motor control, planning.

### 3. Concentration/Matching Puzzle (Color-Word Match)
- A color name is displayed as text, and a colored circle is shown.
- Players must click the circle only when the text matches the color of the circle.
- **Skills tested:** Concentration, inhibition, pattern recognition.

### 4. Multitasking/Combined Puzzle (Find Numbers)
- Players are shown a grid or sequence of numbers.
- The task is to find and click on the number six, and possibly all numbers in order or as prompted.
- This may be combined with other tasks, requiring players to switch focus.
- **Skills tested:** Multitasking, visual search, teamwork, adaptability.

---

## Puzzle Flow in the Game
1. Puzzle is generated (e.g., a color-number sequence, a draggable path, etc.).
2. Players view the puzzle for a limited time.
3. Puzzle is hidden or a question/task is presented.
4. Players submit answers (e.g., click the correct color, drag the circle, etc.).
5. Game checks answers and updates team score and point transfers.
6. If a player solves a puzzle, the next player receives the award points, and the solver gets a new random puzzle.
7. If a player’s points reach zero, they are out and cannot play further puzzles.
8. The game continues until all players are out or all puzzles are completed.

---

## Summary Table

| Rule/Parameter         | Value (Configurable)         |
|-----------------------|-----------------------------|
| Starting Points       | 15                          |
| Point Decay Interval  | 5 seconds                   |
| Points Lost per Decay | 1                           |
| Award for Solving     | 5 (to next player)          |
| Revive Mechanic       | None                        |
| Play Mode             | All players simultaneous    |
| Puzzle Assignment     | Random after each solve     |
| Goal                  | Survive as long as possible |

| Puzzle Type      | Example Task                                 | Skills Tested                   |
|------------------|----------------------------------------------|---------------------------------|
| Memory           | Recall color for a number                    | Memory, attention               |
| Spatial/Path     | Drag circle to the other side, avoid orange  | Spatial, planning, motor skills |
| Concentration    | Click when text matches circle color         | Concentration, inhibition       |
| Multitasking     | Find/click number six and all numbers        | Multitasking, visual search     | 