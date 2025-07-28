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
  status: ('healthy' | 'degraded' | 'unhealthy');
  timestamp: string;
  /** API version */
  version?: string;
  /** Server uptime in seconds */
  uptime?: number;
}

/** Team Color Validation Response: Response for team color validation */
export interface TeamColorValidationResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

/** Color Conflict Resolution Response: Response for color conflict resolution */
export interface ColorConflictResolutionResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

/** Available Colors Response: Response for available colors */
export interface AvailableColorsResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

/** User Out: User response model */
export interface UserOut {
  /** User ID */
  id: number;
  /** Username */
  username: string;
  /** Team ID */
  team_id?: number;
  /** Current points */
  points: number;
  /** Assigned color */
  color?: string;
}

/** Team Out: Team response model */
export interface TeamOut {
  /** Team ID */
  id: number;
  /** Team name */
  name: string;
}

/** Team With Members Out: Team with members response model */
export interface TeamWithMembersOut {
  /** Team ID */
  id: number;
  /** Team name */
  name: string;
  /** Team members */
  members: any[];
}

/** Game Session Out: Game session response model */
export interface GameSessionOut {
  /** Game session ID */
  id: number;
  /** Team ID */
  team_id: number;
  /** Game session status */
  status: ('lobby' | 'countdown' | 'active' | 'finished');
  /** When the game started */
  started_at?: string;
  /** When the game ended */
  ended_at?: string;
  /** How long the team survived in seconds */
  survival_time_seconds?: number;
}

/** Puzzle State: Puzzle state response model */
export interface PuzzleState {
  /** Puzzle ID */
  id: number;
  /** Puzzle type */
  type: ('memory' | 'spatial' | 'concentration' | 'multitasking');
  /** Puzzle-specific data */
  data: any;
  /** Puzzle status */
  status: ('active' | 'completed' | 'failed');
  /** Correct answer for the puzzle */
  correct_answer: string;
}

/** Puzzle Result: Puzzle result response model */
export interface PuzzleResult {
  /** Whether the answer was correct */
  correct: boolean;
  /** ID of user who received points */
  awarded_to_user_id?: number;
  /** Number of points awarded */
  points_awarded: number;
  /** ID of next puzzle (if any) */
  next_puzzle_id?: number;
  /** Next puzzle data (if any) */
  next_puzzle?: any;
}

/** Player Points: Player points response model */
export interface PlayerPoints {
  /** User ID */
  user_id: number;
  /** Username */
  username: string;
  /** Current points */
  points: number;
}

/** Team Points: Team points response model */
export interface TeamPoints {
  /** Team ID */
  team_id: number;
  /** List of players with their points */
  players: any[];
}
