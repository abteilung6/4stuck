/**
 * Auto-generated from 4stuck/schemas/core/v1/communication.json
 */

/** Position: 2D position coordinates */
export interface Position {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/** Player Color: Available player colors */
export interface PlayerColor {
}

/** Mouse Position: Real-time mouse cursor position for a player */
export interface MousePosition {
  /** ID of the player whose mouse position this represents */
  user_id: number;
  /** X coordinate of mouse position */
  x: number;
  /** Y coordinate of mouse position */
  y: number;
  /** When this position was recorded */
  timestamp: string;
  /** Color of the player for cursor display */
  color?: any;
  /** Normalized X coordinate (0-1) for cross-browser consistency */
  normalized_x?: number;
  /** Normalized Y coordinate (0-1) for cross-browser consistency */
  normalized_y?: number;
}

/** Puzzle Interaction: Player interaction with a puzzle */
export interface PuzzleInteraction {
  /** ID of the player making the interaction */
  user_id: number;
  /** ID of the puzzle being interacted with */
  puzzle_id: number;
  /** Type of interaction performed */
  interaction_type: 'click | drag | submit | timeout | start | complete';
  /** Additional data specific to the interaction type */
  interaction_data?: Record<string, any>;
  /** When the interaction occurred */
  timestamp?: string;
}
