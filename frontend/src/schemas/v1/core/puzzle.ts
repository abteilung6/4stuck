/**
 * Auto-generated from 4stuck/schemas/core/v1/puzzle.json
 */

/** Puzzle Type: Types of puzzles available */
export interface PuzzleType {
}

/** Puzzle State: Current state of a puzzle for a player */
export interface PuzzleState {
  /** Unique puzzle identifier */
  id: number;
  /** ID of the player this puzzle is for */
  user_id: number;
  /** Type of puzzle */
  type: any;
  /** Puzzle-specific data */
  data: any;
  /** When the puzzle was created */
  created_at: string;
  /** When the puzzle was solved (if solved) */
  solved_at?: string;
  /** Whether the puzzle has been solved */
  is_solved?: boolean;
  /** Time limit in seconds (if applicable) */
  time_limit?: number;
}

/** Puzzle Data: Union of all puzzle data types */
export interface PuzzleData {
}

/** Memory Puzzle Data: Data for memory puzzle (color-number association) */
export interface MemoryPuzzleData {
  /** Color to number mapping */
  mapping: Record<string, any>;
  /** Number to ask about */
  question_number: string;
  /** Available color choices */
  choices: string[];
}

/** Spatial Puzzle Data: Data for spatial puzzle (drag circle through obstacles) */
export interface SpatialPuzzleData {
  /** Starting position for the draggable circle */
  start_position: any;
  /** Target end position */
  end_position: any;
  /** Positions of obstacles to avoid */
  obstacles: any[];
  /** Radius of the draggable circle */
  circle_radius?: number;
}

/** Concentration Puzzle Data: Data for concentration puzzle (color-word matching) */
export interface ConcentrationPuzzleData {
  /** Sequence of color-word pairs */
  pairs: Record<string, any>[];
  /** Index of the correct matching pair */
  correct_index: number;
  /** Duration in seconds each pair is shown */
  duration: number;
}

/** Multitasking Puzzle Data: Data for multitasking puzzle (find all sixes) */
export interface MultitaskingPuzzleData {
  /** Grid of numbers (mostly 9s with one 6 per row) */
  rows: string[][];
  /** Positions of all 6s in the grid */
  six_positions: Record<string, any>[];
  /** Time limit in seconds */
  time_limit: number;
}

/** Puzzle Result: Result of submitting a puzzle answer */
export interface PuzzleResult {
  /** Whether the answer was correct */
  correct: boolean;
  /** Next puzzle for the player (if any) */
  next_puzzle?: any;
  /** Points awarded to the next player */
  points_awarded?: number;
  /** Feedback message for the player */
  message?: string;
  /** ID of the user who received the points */
  awarded_to_user_id?: number;
  /** ID of the next puzzle (if any) */
  next_puzzle_id?: number;
}
