# Team.försvarsmakten Schema Definitions

This directory contains centralized JSON Schema definitions for the Team.försvarsmakten game. These schemas serve as the single source of truth for data models across both backend (Python/Pydantic) and frontend (TypeScript) codebases.

## Directory Structure

```
schemas/
├── core/           # Core domain models (Game, Player, Team, Puzzle)
├── websocket/      # WebSocket message types and events
├── api/           # REST API request/response models
├── generator/     # Code generation tools and scripts
└── README.md      # This file
```

## Schema Organization

### Core Domain Models (`core/v1/`)
- **game.json**: Game sessions, game states, and game flow
- **player.json**: Players, teams, and player-related data
- **puzzle.json**: All puzzle types and puzzle-related data
- **communication.json**: Communication primitives (positions, colors, etc.)

### WebSocket Models (`websocket/v1/`)
- **messages.json**: WebSocket message types and structures
- **events.json**: Event definitions and payloads

### API Models (`api/v1/`)
- **requests.json**: REST API request models
- **responses.json**: REST API response models

## Naming Conventions

- **Files**: Use lowercase with version subdirectories (e.g., `v1/game.json`)
- **Definitions**: Use PascalCase for model names (e.g., `GameState`, `Player`)
- **Properties**: Use snake_case for property names (e.g., `user_id`, `created_at`)
- **References**: Use `$ref` with full schema paths for cross-references

## Versioning Strategy

- **v1**: Initial version of each schema
- **v2, v3, etc.**: Major schema changes that break backward compatibility
- **Migration**: When creating v2 schemas, maintain v1 for backward compatibility

## Code Generation

The schemas are used to generate:
- **Python/Pydantic models** for the FastAPI backend
- **TypeScript interfaces** for the React frontend
- **API documentation** and validation

## Usage

1. **Define schemas** in the appropriate domain files
2. **Generate code** using the tools in `generator/`
3. **Validate data** against schemas at runtime
4. **Update schemas** when adding new features or changing data structures

## Schema Validation

All schemas should:
- Include proper `$schema` and `$id` fields
- Use descriptive `title` and `description` fields
- Define required properties explicitly
- Use appropriate data types and constraints
- Include examples where helpful

## Cross-References

Use `$ref` to reference definitions across schemas:
```json
{
  "properties": {
    "player": {
      "$ref": "4stuck/schemas/core/v1/player.json#/definitions/Player"
    }
  }
}
```

## Contributing

When adding new schemas or modifying existing ones:
1. Follow the naming conventions
2. Add proper documentation
3. Include examples
4. Update this README if needed
5. Test code generation
6. Validate with real data 