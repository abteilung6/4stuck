/**
 * Auto-generated from 4stuck/schemas/core/v1/game.json
 */

/** Game Status: Current status of a game session */
export interface GameStatus {
}

/** Game Session: A game session for a team */
export interface GameSession {
  /** Unique game session identifier */
  id: number;
  /** ID of the team playing this session */
  team_id: number;
  /** Current status of the game session */
  status: any;
  /** When the game session was created */
  created_at: string;
  /** When the game started (active status) */
  started_at?: string;
  /** When the game ended (finished status) */
  ended_at?: string;
  /** How long the team survived in seconds */
  survival_time_seconds?: number;
  /** Countdown duration in seconds before game starts */
  countdown_duration?: number;
}

/** Game State: Complete current state of a game */
export interface GameState {
  /** Current game session information */
  session: any;
  /** All players in the game with current state */
  players: any[];
  /** Current puzzles for all players */
  puzzles?: any[];
  /** When this game state was captured */
  timestamp: string;
  /** Seconds remaining in countdown (if in countdown status) */
  countdown_remaining?: number;
  /** When the next point decay will occur */
  next_point_decay?: string;
}

/** Game Configuration: Configuration parameters for the game */
export interface GameConfig {
  /** Starting points for each player */
  starting_points: number;
  /** Seconds between point decay events */
  point_decay_interval: number;
  /** Points lost per decay event */
  points_lost_per_decay: number;
  /** Points awarded to next player when puzzle is solved */
  points_awarded_for_solving: number;
  /** Maximum number of players per team */
  max_team_size?: number;
  /** Countdown duration in seconds before game starts */
  countdown_duration?: number;
}

/** Game Result: Final result of a completed game session */
export interface GameResult {
  /** The completed game session */
  session: any;
  /** Total survival time in seconds */
  survival_time_seconds: number;
  /** Final state of all players */
  final_players: any[];
  /** Number of puzzles solved by each player */
  puzzles_solved_per_player?: Record<string, any>;
  /** Total points given by each player to teammates */
  points_given_per_player?: Record<string, any>;
  /** Total points received by each player from teammates */
  points_received_per_player?: Record<string, any>;
}
