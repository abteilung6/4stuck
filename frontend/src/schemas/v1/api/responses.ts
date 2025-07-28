/**
 * Auto-generated from 4stuck/schemas/api/v1/responses.json
 */

/** API Response: Base structure for all API responses */
export interface ApiResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (if successful) */
  data?: any;
  /** Error message (if not successful) */
  error?: string;
  /** Additional message or description */
  message?: string;
}

/** Team Response: Response containing team information */
export interface TeamResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Available Teams Response: Response containing list of available teams */
export interface AvailableTeamsResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

/** Player Response: Response containing player information */
export interface PlayerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Game Session Response: Response containing game session information */
export interface GameSessionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Game State Response: Response containing complete game state */
export interface GameStateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Game Result Response: Response containing game result information */
export interface GameResultResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Puzzle Response: Response containing puzzle information */
export interface PuzzleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Puzzle Result Response: Response containing puzzle submission result */
export interface PuzzleResultResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/** Color Assignment Response: Response containing color assignment result */
export interface ColorAssignmentResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

/** Countdown Response: Response containing countdown information */
export interface CountdownResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

/** Error Response: Standard error response */
export interface ErrorResponse {
  success: any;
  /** Error message */
  error: string;
  /** Additional error details */
  message?: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: Record<string, any>;
}

/** Success Response: Standard success response */
export interface SuccessResponse {
  success: any;
  /** Success message */
  message?: string;
  /** Response data */
  data?: any;
}

/** Health Check Response: API health check response */
export interface HealthCheckResponse {
  success: any;
  status: 'healthy | degraded | unhealthy';
  timestamp: string;
  /** API version */
  version?: string;
  /** Server uptime in seconds */
  uptime?: number;
}
