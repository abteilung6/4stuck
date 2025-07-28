# Team.försvarsmakten - Schema Generation Makefile
# This Makefile provides commands for generating code from JSON Schema definitions

.PHONY: help generate-schemas generate-backend generate-frontend generate-websocket-backend-schema clean validate-schemas test-generated

# Default target
help:
	@echo "Team.försvarsmakten Schema Generation"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@echo "  generate-schemas              - Generate all schemas (backend + frontend)"
	@echo "  generate-backend              - Generate only backend Pydantic models"
	@echo "  generate-frontend             - Generate only frontend TypeScript interfaces"
	@echo "  generate-websocket-backend-schema - Generate only WebSocket backend schemas"
	@echo "  validate-schemas              - Validate all JSON Schema files"
	@echo "  test-generated                - Test generated code"
	@echo "  clean                         - Clean all generated files"
	@echo "  help                          - Show this help message"
	@echo ""

# Generate all schemas (backend + frontend)
generate-schemas: generate-backend generate-frontend
	@echo "✅ All schemas generated successfully!"

# Generate only backend Pydantic models
generate-backend:
	@echo "🔧 Generating backend Pydantic models..."
	cd backend && python ../schemas/generator/generate_python.py \
		--schemas-dir ../schemas \
		--output-dir app/schemas
	@echo "✅ Backend schemas generated!"

# Generate only frontend TypeScript interfaces
generate-frontend:
	@echo "🔧 Generating frontend TypeScript interfaces..."
	cd frontend && python ../schemas/generator/generate_typescript.py \
		--schemas-dir ../schemas \
		--output-dir src/schemas
	@echo "✅ Frontend schemas generated!"

# Generate only WebSocket backend schemas
generate-websocket-backend-schema:
	@echo "🔧 Generating WebSocket backend schemas..."
	cd backend && python ../schemas/generator/generate_python.py \
		--schemas-dir ../schemas \
		--output-dir app/schemas \
		--include websocket
	@echo "✅ WebSocket backend schemas generated!"

# Validate all JSON Schema files
validate-schemas:
	@echo "🔍 Validating JSON Schema files..."
	cd schemas && python generator/validate_schemas.py
	@echo "✅ Schema validation complete!"

# Test generated code
test-generated:
	@echo "🧪 Testing generated code..."
	cd backend && python -m pytest tests/test_generated_schemas.py -v
	@echo "✅ Generated code tests complete!"

# Clean all generated files
clean:
	@echo "🧹 Cleaning generated files..."
	rm -rf backend/app/schemas/*
	rm -rf frontend/src/schemas/*
	@echo "✅ Cleaned all generated files!"

# Development helpers
dev-generate: clean generate-schemas
	@echo "🔄 Development cycle: cleaned and regenerated all schemas!"

dev-test: generate-schemas test-generated
	@echo "🧪 Development cycle: generated and tested schemas!"

# Quick validation and generation
quick: validate-schemas generate-schemas
	@echo "⚡ Quick cycle: validated and generated schemas!" 