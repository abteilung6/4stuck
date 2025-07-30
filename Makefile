.PHONY: help install install-dev ruff-format ruff-lint mypy-check clean generate-backend generate-frontend generate-all

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
ruff-format:
	@echo "🎨 Formatting code with Ruff..."
	ruff format backend/app/ schemas/ --exclude backend/app/schemas/
	@echo "✅ Code formatted!"

# Lint code with Ruff
ruff-lint:
	@echo "🔍 Linting code with Ruff..."
	ruff check backend/ schemas/ --fix --exclude backend/app/schemas/
	@echo "✅ Code linted!"

# Run type checking with MyPy
mypy-check:
	@echo "🔍 Running type checks with MyPy..."
	cd backend && . venv/bin/activate && mypy --explicit-package-bases . ../schemas/
	@echo "✅ Type checks completed!"
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
	cd backend && . venv/bin/activate && python ../schemas/generator/generate_python.py --schemas-dir ../schemas --output-dir app/schemas
	@echo "✅ Backend schemas generated!"

# Generate frontend schemas
generate-frontend:
	@echo "🔧 Generating frontend schemas..."
	cd backend && . venv/bin/activate && python ../schemas/generator/generate_typescript.py --schemas-dir ../schemas --output-dir ../frontend/src/schemas
	@echo "✅ Frontend schemas generated!"

# Generate all schemas
generate-all: generate-backend generate-frontend
	@echo "✅ All schemas generated!"
