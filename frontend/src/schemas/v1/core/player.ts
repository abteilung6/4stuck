/**
 * Auto-generated from 4stuck/schemas/core/v1/player.json
 */

/** Player: A player in the game */
export interface Player {
  /** Unique player identifier */
  id: number;
  /** Player's display name */
  username: string;
  /** ID of the team this player belongs to */
  team_id: number;
  /** Color assigned to this player for identification */
  color?: any;
  /** Current points (0 = eliminated) */
  points: number;
  /** Whether the player has been eliminated from the game */
  is_eliminated?: boolean;
  /** Whether the player is ready to start the game */
  is_ready?: boolean;
  /** When the player was created */
  created_at?: string;
  /** When the player was last active */
  last_active?: string;
}

/** Team: A team of players */
export interface Team {
  /** Unique team identifier */
  id: number;
  /** Team name */
  name: string;
  /** Players in this team */
  members?: any[];
  /** Number of players in the team */
  player_count?: number;
  /** When the team was created */
  created_at?: string;
}

/** Team Status: Team availability status */
export interface TeamStatus {
}

/** Available Team: Team that can accept new players */
export interface AvailableTeam {
  /** Team identifier */
  id: number;
  /** Team name */
  name: string;
  /** Current team members */
  members: any[];
  /** Number of players in the team */
  player_count: number;
  /** Current team status */
  status: any;
  /** ID of active game session (if any) */
  game_session_id?: number;
  /** Status of active game session (if any) */
  game_status?: 'lobby | countdown | active | finished';
}
