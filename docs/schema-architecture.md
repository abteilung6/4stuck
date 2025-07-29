# Centralized Schema Architecture

## Overview

The Team.försvarsmakten project uses a centralized schema architecture where all data models are defined in JSON Schema format and automatically generated into both Python (Pydantic) and TypeScript types. This ensures type safety, consistency, and maintainability across the entire application.

## Architecture Components

### 1. Schema Directory Structure

```
schemas/
├── core/v1/                    # Core domain models
│   ├── game.json              # Game session and state models
│   ├── player.json            # Player and team models
│   ├── puzzle.json            # Puzzle type definitions
│   └── communication.json     # Communication and position models
├── api/v1/                    # REST API models
│   ├── requests.json          # API request models
│   └── responses.json         # API response models
├── websocket/v1/              # WebSocket communication
│   └── messages.json          # WebSocket message types
└── generator/                 # Code generation tools
    ├── generate_python.py     # Python/Pydantic generator
    └── generate_typescript.py # TypeScript generator
```

### 2. Code Generation

#### Python/Pydantic Generation

The `generate_python.py` script converts JSON Schema definitions into Pydantic models:

```bash
cd backend && python ../schemas/generator/generate_python.py \
    --schemas-dir ../schemas \
    --output-dir app/schemas
```

**Features:**
- Generates proper Pydantic V2 models with `default=None` for optional fields
- Handles complex types (unions, arrays, nested objects)
- Creates proper imports and type hints
- Supports schema versioning with `v1/` subdirectories

#### TypeScript Generation

The `generate_typescript.py` script converts JSON Schema definitions into TypeScript interfaces:

```bash
python schemas/generator/generate_typescript.py \
    --schemas-dir schemas \
    --output-dir frontend/src/schemas
```

**Features:**
- Generates proper TypeScript union types for enums
- Handles optional properties correctly
- Creates index files for easy imports
- Supports schema versioning

### 3. Schema Definitions

#### Core Models

**Game Models (`schemas/core/v1/game.json`):**
- `GameSession`: Game session state and metadata
- `GameState`: Complete game state including players and puzzles
- `GameResult`: Game completion results and statistics

**Player Models (`schemas/core/v1/player.json`):**
- `Player`: Individual player information
- `Team`: Team composition and status
- `AvailableTeam`: Team availability for joining

**Puzzle Models (`schemas/core/v1/puzzle.json`):**
- `PuzzleState`: Current puzzle state and data
- `PuzzleResult`: Puzzle submission results
- Puzzle type-specific data structures

#### API Models

**Request Models (`schemas/api/v1/requests.json`):**
- `UserCreate`: User registration
- `TeamCreate`: Team creation
- `GameSessionCreate`: Game session initialization
- `PuzzleAnswer`: Puzzle answer submission

**Response Models (`schemas/api/v1/responses.json`):**
- `UserOut`: User information response
- `TeamOut`: Team information response
- `GameSessionOut`: Game session response
- `PuzzleResult`: Puzzle submission response

#### WebSocket Models

**Message Models (`schemas/websocket/v1/messages.json`):**
- `IncomingMessage`: Client-to-server messages
- `OutgoingMessage`: Server-to-client messages
- Message types: `mouse_position`, `puzzle_interaction`, `team_communication`, etc.

### 4. Usage in Backend

#### Importing Generated Models

```python
# In backend/app/schemas.py
from .schemas.v1.api.requests import (
    UserCreate, TeamCreate, GameSessionCreate, PuzzleAnswer
)
from .schemas.v1.api.responses import (
    UserOut, TeamOut, GameSessionOut, PuzzleResult
)
from .schemas.v1.websocket.messages import IncomingMessage, OutgoingMessage
```

#### Using in FastAPI Endpoints

```python
from fastapi import APIRouter, Depends
from ..schemas.v1.api.requests import UserCreate
from ..schemas.v1.api.responses import UserOut

@router.post("/users", response_model=UserOut)
def create_user(user: UserCreate):
    # user is a validated Pydantic model
    return UserOut(id=1, username=user.username)
```

#### WebSocket Message Validation

```python
from ..schemas.v1.websocket.messages import IncomingMessage

async def websocket_endpoint(websocket: WebSocket):
    data = await websocket.receive_text()
    try:
        message = IncomingMessage.model_validate_json(data)
        # message is a validated Pydantic model
    except ValidationError as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
```

### 5. Usage in Frontend

#### Importing Generated Types

```typescript
// In frontend/src/api/types.ts
import { UserOut, TeamOut, GameSessionOut } from '../schemas/v1/api/responses';
import { IncomingMessage, OutgoingMessage } from '../schemas/v1/websocket/messages';
```

#### Using in React Components

```typescript
import { UserOut } from '../schemas/v1/api/responses';

interface UserListProps {
  users: UserOut[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
};
```

#### WebSocket Message Handling

```typescript
import { IncomingMessage } from '../schemas/v1/websocket/messages';

const handleWebSocketMessage = (data: string) => {
  try {
    const message: IncomingMessage = JSON.parse(data);
    // message is type-safe
    switch (message.type) {
      case 'mouse_position':
        handleMousePosition(message);
        break;
      case 'puzzle_interaction':
        handlePuzzleInteraction(message);
        break;
    }
  } catch (error) {
    console.error('Invalid WebSocket message:', error);
  }
};
```

### 6. Schema Versioning

The schema architecture supports versioning through subdirectories:

- `v1/`: Current version of all schemas
- Future versions will use `v2/`, `v3/`, etc.

Each schema file includes a `$id` field for version identification:

```json
{
  "$id": "https://4stuck.com/schemas/core/v1/player.json",
  "title": "Player Models",
  "version": "1.0.0"
}
```

### 7. Code Generation Workflow

#### Development Workflow

1. **Define/Update Schema**: Edit JSON Schema files in `schemas/`
2. **Generate Backend**: Run `make generate-backend`
3. **Generate Frontend**: Run `make generate-frontend`
4. **Update OpenAPI**: Backend automatically generates OpenAPI schema
5. **Regenerate API Client**: Run `npx openapi-typescript-codegen`

#### Makefile Commands

```bash
# Generate backend Pydantic models
make generate-backend

# Generate frontend TypeScript types
make generate-frontend

# Generate both backend and frontend
make generate-all

# Validate schemas
make validate-schemas
```

### 8. Benefits

#### Type Safety
- Compile-time type checking in both Python and TypeScript
- Runtime validation with Pydantic
- IntelliSense support in IDEs

#### Consistency
- Single source of truth for all data models
- Automatic synchronization between frontend and backend
- Consistent API contracts

#### Maintainability
- Centralized schema definitions
- Automatic code generation
- Version control for schema changes

#### Developer Experience
- Clear documentation through JSON Schema
- Automatic API documentation generation
- Reduced manual type definition work

### 9. Best Practices

#### Schema Design
- Use descriptive property names
- Include comprehensive examples
- Add proper descriptions for all fields
- Use consistent naming conventions

#### Code Generation
- Always regenerate after schema changes
- Test generated code thoroughly
- Keep generators simple and maintainable
- Version control generated files

#### API Design
- Use consistent response formats
- Include proper error handling
- Document all endpoints
- Maintain backward compatibility

### 10. Migration Guide

#### Adding New Models

1. Define the model in appropriate JSON Schema file
2. Add examples and documentation
3. Run code generation: `make generate-all`
4. Update imports in affected files
5. Test the new model thoroughly

#### Updating Existing Models

1. Update JSON Schema definition
2. Consider backward compatibility
3. Run code generation: `make generate-all`
4. Update any code using the model
5. Test thoroughly

#### Schema Versioning

1. Create new version directory (e.g., `v2/`)
2. Copy and modify schemas as needed
3. Update `$id` fields to reflect new version
4. Generate code for new version
5. Implement migration logic if needed

## Conclusion

The centralized schema architecture provides a robust foundation for the 4stuck project, ensuring type safety, consistency, and maintainability across the entire application stack. By using JSON Schema as the single source of truth and automatically generating code, we reduce errors, improve developer productivity, and maintain high code quality.
