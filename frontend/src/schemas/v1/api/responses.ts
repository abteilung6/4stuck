/**
 * Auto-generated from 
 */

/** Error Response: Standard error response */
export interface ErrorResponse {
  detail: string | Record<string, any>[];
}

/** Team Response: Team information response */
export interface TeamResponse {
  /** Team ID */
  id: number;
  /** Team name */
  name: string;
  /** Team members */
  users: any[];
}

/** User Response: User information response */
export interface UserResponse {
  /** User ID */
  id: number;
  /** Username */
  username: string;
  /** Team ID (if assigned) */
  team_id?: number;
  /** User color */
  color?: string;
}

/** Available Team Response: Available team for joining */
export interface AvailableTeamResponse {
  /** Team ID */
  id: number;
  /** Team name */
  name: string;
  /** Current number of users */
  user_count: number;
  /** Maximum number of users */
  max_users: number;
}

/** Game Session Response: Game session information */
export interface GameSessionResponse {
  /** Game session ID */
  id: number;
  /** Team ID */
  team_id: number;
  /** Game session status */
  status: ('lobby' | 'countdown' | 'active' | 'finished');
  /** When the session was created */
  created_at: string;
  /** When the game started */
  started_at?: string;
  /** When the game ended */
  ended_at?: string;
  /** How long the team survived in seconds */
  survival_time_seconds?: number;
}

/** Puzzle Answer Response: Response to puzzle answer submission */
export interface PuzzleAnswerResponse {
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

/** Puzzle State Response: Puzzle state for API responses */
export interface PuzzleStateResponse {
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
  /** Player points */
  players: any[];
}

/** Color Assignment Response: Response for color assignment operations */
export interface ColorAssignmentResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Response message */
  message: string;
  /** Color reassignments made */
  reassignments?: Record<string, any>;
  /** Color conflicts found */
  conflicts?: Record<string, any>[];
}
