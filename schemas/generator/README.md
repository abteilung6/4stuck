# Code Generator Tools

This directory contains tools for generating code from JSON Schema definitions.

## Overview

The code generators convert JSON Schema definitions into:
- **Python/Pydantic models** for the FastAPI backend
- **TypeScript interfaces** for the React frontend
- **API documentation** and validation

## Tools

### Python/Pydantic Generator (`generate_python.py`)
- Converts JSON Schema to Pydantic models
- Handles complex types (unions, arrays, nested objects)
- Generates proper imports and type hints
- Supports cross-references between schemas

### TypeScript Generator (`generate_typescript.py`)
- Converts JSON Schema to TypeScript interfaces
- Generates proper type unions and optional properties
- Creates index files for easy imports
- Handles enum types and validation

### Schema Validator (`validate_schemas.py`)
- Validates all JSON Schema files
- Checks cross-references and dependencies
- Ensures schema consistency
- Reports validation errors

## Usage

### Generate Python Models
```bash
python generate_python.py --output-dir ../backend/app/schemas
```

### Generate TypeScript Interfaces
```bash
python generate_typescript.py --output-dir ../frontend/src/schemas
```

### Validate Schemas
```bash
python validate_schemas.py
```

## Configuration

### Generator Settings
- **Output directories**: Configure where generated code is placed
- **Import paths**: Set up proper import statements
- **Type mappings**: Map JSON Schema types to language-specific types
- **Validation**: Enable/disable runtime validation

### Schema Discovery
- **Core schemas**: Automatically discover all core domain schemas
- **Cross-references**: Resolve `$ref` references between schemas
- **Dependencies**: Handle schema dependencies and imports

## Generated Code Structure

### Python/Pydantic
```
backend/app/schemas/
├── __init__.py
├── core/
│   ├── __init__.py
│   ├── game.py
│   ├── player.py
│   ├── puzzle.py
│   └── communication.py
├── websocket/
│   ├── __init__.py
│   └── messages.py
└── api/
    ├── __init__.py
    ├── requests.py
    └── responses.py
```

### TypeScript
```
frontend/src/schemas/
├── index.ts
├── core/
│   ├── game.ts
│   ├── player.ts
│   ├── puzzle.ts
│   └── communication.ts
├── websocket/
│   └── messages.ts
└── api/
    ├── requests.ts
    └── responses.ts
```

## Features

### Type Safety
- Full type safety across backend and frontend
- Compile-time validation of data structures
- Runtime validation with Pydantic

### Cross-References
- Proper handling of `$ref` references
- Circular dependency detection
- Import optimization

### Validation
- JSON Schema validation at runtime
- Custom validation rules
- Error reporting and debugging

### Documentation
- Auto-generated documentation
- Type hints and comments
- API documentation generation

## Future Enhancements

- **GraphQL schema generation**
- **Database migration scripts**
- **API client generation**
- **Test data generation**
- **Schema visualization tools** 