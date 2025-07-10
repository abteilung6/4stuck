# Team.försvarsmakten Backend

## Setup & Run Instructions

### 1. Create and activate a virtual environment
```
python3 -m venv venv
source venv/bin/activate
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