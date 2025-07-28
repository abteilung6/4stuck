/**
 * Auto-generated from 4stuck/schemas/api/v1/requests.json
 */

/** Create Team Request: Request to create a new team */
export interface CreateTeamRequest {
  /** Name for the new team */
  name: string;
}

/** Join Team Request: Request to join an existing team */
export interface JoinTeamRequest {
  /** Username for the player joining the team */
  username: string;
  /** ID of the team to join */
  team_id: number;
}

/** Start Game Request: Request to start a game session */
export interface StartGameRequest {
  /** ID of the team starting the game */
  team_id: number;
  /** Countdown duration in seconds before game starts */
  countdown_duration?: number;
}

/** Submit Answer Request: Request to submit a puzzle answer */
export interface SubmitAnswerRequest {
  /** ID of the puzzle being answered */
  puzzle_id: number;
  /** Player's answer to the puzzle */
  answer: string;
  /** ID of the user submitting the answer */
  user_id?: number;
}

/** Get Current Puzzle Request: Request to get the current puzzle for a user */
export interface GetCurrentPuzzleRequest {
  /** ID of the user to get puzzle for */
  user_id: number;
}

/** Assign Color Request: Request to assign a color to a user */
export interface AssignColorRequest {
  /** ID of the user to assign color to */
  user_id: number;
  /** ID of the team the user belongs to */
  team_id: number;
  /** Preferred color (optional) */
  preferred_color?: any;
}

/** Update Player Ready Request: Request to update player ready status */
export interface UpdatePlayerReadyRequest {
  /** ID of the user to update */
  user_id: number;
  /** Whether the player is ready to start */
  is_ready: boolean;
}

/** Get Game State Request: Request to get current game state */
export interface GetGameStateRequest {
  /** ID of the game session */
  session_id: number;
}

/** Get Game Result Request: Request to get game result */
export interface GetGameResultRequest {
  /** ID of the completed game session */
  session_id: number;
}

/** Restart Game Request: Request to restart a game session */
export interface RestartGameRequest {
  /** ID of the team to restart game for */
  team_id: number;
}

/** User Create: Request to create a new user */
export interface UserCreate {
  /** Username for the new user */
  username: string;
}

/** Team Create: Request to create a new team */
export interface TeamCreate {
  /** Name for the new team */
  name: string;
}

/** Game Session Create: Request to create a new game session */
export interface GameSessionCreate {
  /** ID of the team for this game session */
  team_id: number;
}

/** Game Session State Update: Request to update game session state */
export interface GameSessionStateUpdate {
  /** New status for the game session */
  status: ('lobby' | 'countdown' | 'active' | 'finished');
}

/** Puzzle Create: Request to create a new puzzle */
export interface PuzzleCreate {
  /** Type of puzzle to create */
  type: ('memory' | 'spatial' | 'concentration' | 'multitasking');
  /** ID of the game session */
  game_session_id: number;
  /** ID of the user for this puzzle */
  user_id: number;
}

/** Puzzle Answer: Request to submit a puzzle answer */
export interface PuzzleAnswer {
  /** ID of the puzzle being answered */
  puzzle_id: number;
  /** Player's answer to the puzzle */
  answer: string;
}
