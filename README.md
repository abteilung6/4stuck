# 4stuck

[![CI](https://github.com/abteilung6/4stuck/actions/workflows/ci.yml/badge.svg)](https://github.com/abteilung6/4stuck/actions/workflows/ci.yml)

A collaborative, team-based cognitive puzzle game inspired by Swedish military training principles. The game emphasizes teamwork, cognitive skills, and stress management under time pressure.

## 🎯 Overview

4stuck is a multiplayer puzzle game where teams of 4 players must solve various cognitive challenges while supporting each other to survive as long as possible. Players lose points over time and must rely on teammates to keep them alive.

## 🎮 Game Features

### Puzzle Types
1. **Memory Puzzle**: Color-number association
2. **Spatial Puzzle**: Path finding with obstacles
3. **Concentration Puzzle**: Color-word matching
4. **Multitasking Puzzle**: Find all sixes in grid

### Game Mechanics
- **Team Size**: 4 players per team
- **Starting Points**: 15 per player
- **Point Decay**: 1 point every 5 seconds
- **Point Transfer**: 5 points to next player on puzzle solve
- **Elimination**: Players eliminated at 0 points
- **Victory Condition**: Survive as long as possible


## 🏗️ Architecture

- **Backend**: FastAPI + SQLAlchemy + WebSocket
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite (development) / PostgreSQL (production)
- **Code Quality**: Ruff + MyPy + Pre-commit hooks

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abteilung6/4stuck/
   cd team-human
   ```

2. **Install dependencies**
   ```bash
   make install-dev
   ```

3. **Set up pre-commit hooks**
   ```bash
   pre-commit install
   ```

4. **Generate schemas**
   ```bash
   make generate-all
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## 🧪 Testing

### Backend Tests
```bash
make test-backend
```

### Frontend Tests
```bash
make test-frontend
```

### All Tests
```bash
make test-backend && make test-frontend
```

## 🔧 Development Commands

### Code Quality
```bash
make ruff-format    # Format code
make ruff-lint      # Lint code
make mypy-check     # Type checking
```

### Schema Generation
```bash
make generate-backend   # Generate Python schemas
make generate-frontend  # Generate TypeScript schemas
make generate-all       # Generate all schemas
```

### Cleanup
```bash
make clean  # Remove cache files
```
