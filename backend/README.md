# Backend

FastAPI backend for the collaborative puzzle game.

## Requirements Structure

This project uses a two-file requirements structure for better separation of concerns:

- **`requirements.txt`** - Production/runtime dependencies only
- **`requirements-dev.txt`** - Development and testing tools (includes production requirements)

## Setup

### Development Environment

For development work, install all dependencies including development tools:

```bash
# Install development dependencies (includes production)
pip install -r requirements-dev.txt

# Or use the Makefile
make install-dev
```

### Production Environment

For production deployments, install only runtime dependencies:

```bash
# Install production dependencies only
pip install -r requirements.txt

# Or use the Makefile
make install
```

### Full Development Setup

For a complete development environment with pre-commit hooks:

```bash
make setup-dev
```

## Development Tools

The following development tools are included in `requirements-dev.txt`:

- **Ruff** - Fast Python linter and formatter
- **MyPy** - Static type checker
- **Pre-commit** - Git hooks for code quality
- **Pytest** - Testing framework
- **Pytest-asyncio** - Async testing support
- **Pytest-cov** - Coverage reporting
- **Coverage** - Code coverage tool
- **Black** - Code formatter (alternative to Ruff)
- **isort** - Import sorting (alternative to Ruff)
- **Flake8** - Linter (alternative to Ruff)

## Code Quality

### Formatting

```bash
# Format code with Ruff
make format

# Or directly
ruff format backend/ schemas/
```

### Linting

```bash
# Lint and auto-fix code
make lint

# Or directly
ruff check backend/ schemas/ --fix
```

### Type Checking

```bash
# Run type checks
make type-check

# Or directly
mypy backend/ schemas/
```

### All Checks

```bash
# Run formatting, linting, and type checking
make check
```

### Pre-commit Hooks

Pre-commit hooks are automatically installed with `make setup-dev` and will run on every commit to ensure code quality.

## Testing

```bash
# Run all tests with coverage
make test

# Or directly
python -m pytest tests/ -v --cov=app --cov-report=term-missing
```

## Schema Generation

```bash
# Generate all schemas
make generate-all

# Or generate individually
make generate-backend
make generate-frontend
```

## Development Server

```bash
# Start development server
make dev-backend

# Or directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── routers/          # FastAPI route handlers
│   ├── services/         # Business logic services
│   ├── schemas/          # Generated Pydantic models
│   ├── utils/            # Utility functions
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # Database configuration
│   └── main.py           # FastAPI application
├── tests/                # Test files
├── requirements.txt      # Production dependencies
├── requirements-dev.txt  # Development dependencies
└── README.md            # This file
```

## Configuration

- **Line Length**: 120 characters (configured in `pyproject.toml`)
- **Python Version**: 3.9+
- **Code Style**: Ruff with Black-compatible formatting
- **Type Checking**: MyPy with strict settings
