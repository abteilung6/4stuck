# Schema Code Generators

This directory contains code generators that convert JSON Schema definitions into Python/Pydantic models and TypeScript interfaces.

## 🎯 Overview

The generators create type-safe, validated models from a single source of truth (JSON Schema), ensuring consistency between backend and frontend.

## 📁 Generated Structure

### Backend (Python/Pydantic)
```
backend/app/schemas/
├── __init__.py
└── v1/
    ├── __init__.py
    ├── core/
    │   ├── __init__.py
    │   ├── communication.py
    │   ├── game.py
    │   ├── player.py
    │   └── puzzle.py
    ├── websocket/
    │   ├── __init__.py
    │   └── messages.py
    └── api/
        ├── __init__.py
        ├── requests.py
        └── responses.py
```

### Frontend (TypeScript)
```
frontend/src/schemas/
├── index.ts
└── v1/
    ├── index.ts
    ├── core/
    │   ├── index.ts
    │   ├── communication.ts
    │   ├── game.ts
    │   ├── player.ts
    │   └── puzzle.ts
    ├── websocket/
    │   ├── index.ts
    │   └── messages.ts
    └── api/
        ├── index.ts
        ├── requests.ts
        └── responses.ts
```

## 🚀 Usage

### Using Makefile (Recommended)

From the project root (`team-human/`):

```bash
# Generate all schemas (backend + frontend)
make generate-schemas

# Generate only backend Pydantic models
make generate-backend

# Generate only frontend TypeScript interfaces
make generate-frontend

# Generate only WebSocket backend schemas
make generate-websocket-backend-schema

# Validate all JSON Schema files
make validate-schemas

# Clean all generated files
make clean

# Development helpers
make dev-generate  # Clean + generate all
make dev-test      # Generate + test
make quick         # Validate + generate
```

### Direct Script Usage

```bash
# Python/Pydantic generation
cd backend
python ../schemas/generator/generate_python.py \
    --schemas-dir ../schemas \
    --output-dir app/schemas \
    --include websocket  # Optional: only generate specific types

# TypeScript generation
cd frontend
python ../schemas/generator/generate_typescript.py \
    --schemas-dir ../schemas \
    --output-dir src/schemas

# Schema validation
cd schemas
python generator/validate_schemas.py
```

## 🔧 Generator Features

### Python/Pydantic Generator
- ✅ Converts JSON Schema to Pydantic models
- ✅ Supports complex types (unions, arrays, nested objects)
- ✅ Generates proper imports and type hints
- ✅ Creates v1 subdirectory structure
- ✅ Selective generation with `--include` flag
- ✅ Auto-generates `__init__.py` files

### TypeScript Generator
- ✅ Converts JSON Schema to TypeScript interfaces
- ✅ Supports union types and optional properties
- ✅ Generates proper JSDoc comments
- ✅ Creates v1 subdirectory structure
- ✅ Auto-generates `index.ts` files
- ✅ Selective generation with `--include` flag

### Schema Validator
- ✅ Validates JSON Schema syntax
- ✅ Checks reference integrity
- ✅ Validates schema structure
- ✅ Reports errors and warnings

## 📋 Migration Strategy

### Phase 1: Generate Alongside Existing
1. Generate new models to `backend/app/schemas/v1/`
2. Keep existing `schemas.py` for now
3. Test new models work correctly

### Phase 2: Replace Existing
1. Update all imports to use generated models
2. Remove old `schemas.py`
3. Ensure all tests pass

### Phase 3: Update WebSocket Handlers
1. Replace manual message parsing with validated models
2. Add runtime validation to WebSocket handlers
3. Test real-time communication

## 🧪 Testing

```bash
# Test generated code
make test-generated

# Validate schemas before generation
make validate-schemas

# Full development cycle
make dev-test
```

## 🔄 Development Workflow

1. **Update JSON Schema** in `schemas/core/v1/`, `schemas/websocket/v1/`, or `schemas/api/v1/`
2. **Validate schemas**: `make validate-schemas`
3. **Generate code**: `make generate-schemas`
4. **Test changes**: `make test-generated`
5. **Update imports** in your code to use generated models

## 📝 Example Usage

### Backend (Python)
```python
from app.schemas.v1.core.game import GameState, GameSession
from app.schemas.v1.websocket.messages import MousePositionMessage

# Use generated models
game_state = GameState(
    session_id=123,
    status="active",
    players=[...],
    puzzles=[...]
)
```

### Frontend (TypeScript)
```typescript
import { GameState, GameSession } from '../schemas/v1/core/game';
import { MousePositionMessage } from '../schemas/v1/websocket/messages';

// Use generated interfaces
const gameState: GameState = {
    session_id: 123,
    status: "active",
    players: [...],
    puzzles: [...]
};
```

## 🎯 Benefits

- **Type Safety**: Generated models ensure consistency
- **Validation**: Automatic runtime validation
- **Documentation**: Auto-generated docstrings
- **Maintainability**: Single source of truth
- **Versioning**: Easy to manage schema versions
- **Testing**: Generated models are testable

## 🔧 Configuration

### Selective Generation
Use the `--include` flag to generate only specific schema types:

```bash
# Only WebSocket schemas
make generate-websocket-backend-schema

# Only core schemas
python generate_python.py --include core

# Multiple types
python generate_python.py --include core websocket
```

### Custom Output Directories
Override the default output directories:

```bash
python generate_python.py --output-dir custom/path
python generate_typescript.py --output-dir custom/path
```

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure to run `make generate-schemas` after schema changes
2. **Validation Errors**: Run `make validate-schemas` to check schema syntax
3. **Missing Dependencies**: Install `jsonschema` in backend: `pip install jsonschema`

### Debug Mode

Add `--verbose` flag to generators for detailed output:

```bash
python generate_python.py --verbose
```

## 📚 Next Steps

1. **Migrate existing code** to use generated models
2. **Add runtime validation** to WebSocket handlers
3. **Update tests** to use generated models
4. **Add CI/CD integration** for schema generation
5. **Document migration guide** for team members 