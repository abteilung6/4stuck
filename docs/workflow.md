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