# Team.försvarsmakten - Schema Generation Makefile
# This Makefile provides commands for generating code from JSON Schema definitions

.PHONY: help install install-dev format lint check test clean generate-backend generate-frontend generate-all

# Default target
help:
	@echo "Available commands:"
	@echo "  install        - Install production dependencies"
	@echo "  install-dev    - Install development dependencies (includes production)"
	@echo "  format         - Format code with Ruff"
	@echo "  lint           - Lint code with Ruff"
	@echo "  check          - Run all checks (format + lint + type check)"
	@echo "  test           - Run tests"
	@echo "  clean          - Clean up cache files"
	@echo "  generate-backend  - Generate backend schemas"
	@echo "  generate-frontend - Generate frontend schemas"
	@echo "  generate-all   - Generate all schemas"

# Install production dependencies only
install:
	@echo "🔧 Installing production dependencies..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ Production dependencies installed!"

# Install development dependencies (includes production)
install-dev:
	@echo "🔧 Installing development dependencies..."
	cd backend && pip install -r requirements-dev.txt
	cd frontend && npm install
	@echo "✅ Development dependencies installed!"

# Format code with Ruff
format:
	@echo "🎨 Formatting code with Ruff..."
	ruff format backend/ schemas/
	@echo "✅ Code formatted!"

# Lint code with Ruff
lint:
	@echo "🔍 Linting code with Ruff..."
	ruff check backend/ schemas/ --fix
	@echo "✅ Code linted!"

# Run type checking with MyPy
type-check:
	@echo "🔍 Running type checks with MyPy..."
	mypy backend/ schemas/
	@echo "✅ Type checks completed!"

# Run all checks
check: format lint type-check
	@echo "✅ All checks completed!"

# Run tests
test:
	@echo "🧪 Running tests..."
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=term-missing
	cd frontend && npm test
	@echo "✅ Tests completed!"

# Clean up cache files
clean:
	@echo "🧹 Cleaning up cache files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf .coverage
	rm -rf htmlcov/
	@echo "✅ Cleanup completed!"

# Generate backend schemas
generate-backend:
	@echo "🔧 Generating backend schemas..."
	cd backend && python -m schemas.generator.generate_python --schemas-dir ../schemas --output-dir app/schemas
	@echo "✅ Backend schemas generated!"

# Generate frontend schemas
generate-frontend:
	@echo "🔧 Generating frontend schemas..."
	cd frontend && python ../schemas/generator/generate_typescript.py --schemas-dir ../schemas --output-dir src/schemas
	@echo "✅ Frontend schemas generated!"

# Generate all schemas
generate-all: generate-backend generate-frontend
	@echo "✅ All schemas generated!"

# Install pre-commit hooks
install-hooks:
	@echo "🔧 Installing pre-commit hooks..."
	pre-commit install
	@echo "✅ Pre-commit hooks installed!"

# Run pre-commit on all files
pre-commit-all:
	@echo "🔧 Running pre-commit on all files..."
	pre-commit run --all-files
	@echo "✅ Pre-commit completed!"

# Development server
dev-backend:
	@echo "🚀 Starting backend development server..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "🚀 Starting frontend development server..."
	cd frontend && npm run dev

# Full development setup
setup-dev: install-dev install-hooks
	@echo "✅ Development environment setup complete!"
	@echo "Run 'make dev-backend' to start the backend server"
	@echo "Run 'make dev-frontend' to start the frontend server"
