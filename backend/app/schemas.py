# Import generated schemas from centralized JSON Schema definitions
from .schemas.v1.api.requests import (
    UserCreate,
    TeamCreate,
    GameSessionCreate,
    GameSessionStateUpdate,
    PuzzleCreate,
    PuzzleAnswer,
    AssignColorRequest,
    UpdatePlayerReadyRequest,
    GetGameStateRequest,
    GetGameResultRequest,
    RestartGameRequest,
    GetCurrentPuzzleRequest,
    SubmitAnswerRequest,
    StartGameRequest,
    CreateTeamRequest,
    JoinTeamRequest
)

from .schemas.v1.api.responses import (
    UserOut,
    TeamOut,
    TeamWithMembersOut,
    AvailableTeamOut,
    GameSessionOut,
    PuzzleState,
    PuzzleResult,
    PlayerPoints,
    TeamPoints,
    ColorAssignmentResponse,
    ColorConflictResolutionResponse,
    TeamColorValidationResponse,
    AvailableColorsResponse,
    ApiResponse,
    ErrorResponse,
    SuccessResponse,
    HealthCheckResponse
)

# Re-export all schemas for backward compatibility
__all__ = [
    # Request schemas
    'UserCreate', 'TeamCreate', 'GameSessionCreate', 'GameSessionStateUpdate',
    'PuzzleCreate', 'PuzzleAnswer', 'AssignColorRequest', 'UpdatePlayerReadyRequest',
    'GetGameStateRequest', 'GetGameResultRequest', 'RestartGameRequest',
    'GetCurrentPuzzleRequest', 'SubmitAnswerRequest', 'StartGameRequest',
    'CreateTeamRequest', 'JoinTeamRequest',
    
    # Response schemas
    'UserOut', 'TeamOut', 'TeamWithMembersOut', 'AvailableTeamOut',
    'GameSessionOut', 'PuzzleState', 'PuzzleResult', 'PlayerPoints',
    'TeamPoints', 'ColorAssignmentResponse', 'ColorConflictResolutionResponse',
    'TeamColorValidationResponse', 'AvailableColorsResponse', 'ApiResponse',
    'ErrorResponse', 'SuccessResponse', 'HealthCheckResponse'
] 