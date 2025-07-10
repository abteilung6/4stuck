# Team.försvarsmakten Backend

## Setup & Run Instructions

### 1. Create and activate a virtual environment
```
python3 -m venv backend/venv
source backend/venv/bin/activate
```

### 2. Install dependencies
```
pip install -r requirements.txt
```

### 3. Run the FastAPI development server
```
uvicorn app.main:app --reload --port 8000
```

- The API will be available at: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

---

## Project Structure
- `app/main.py`: FastAPI entrypoint
- `app/routers/`: API route modules
- `app/services/`: Business logic
- `app/utils/`: Utility functions
- `app/models.py`: ORM models (database)
- `app/schemas.py`: Pydantic schemas (validation)
- `app/database.py`: Database setup

---

## API Endpoints

### User & Team
- `POST /team/register` – Register a user
- `POST /team/create` – Create a team
- `POST /team/join` – Join a team

### Game Session
- `POST /game/session` – Start a new game session for a team
  - Request: `{ "team_id": <int> }`
  - Response: `{ "id": <int>, "team_id": <int>, "status": "active" }`
- `GET /game/session/{team_id}` – Get the current active session for a team

---

## Running Tests

1. Make sure your virtual environment is activated:
   ```
   source backend/venv/bin/activate
   ```
2. Run all tests:
   ```
   pytest
   ```

- Tests use a temporary file-based SQLite database for isolation.
- Test coverage includes user/team registration, team joining, and all game session API logic (including error cases). 