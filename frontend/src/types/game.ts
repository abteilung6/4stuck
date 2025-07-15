// Core game types
export interface Player {
  id: number;
  username: string;
  points: number;
}

export interface GameSession {
  id: number;
  status: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface Puzzle {
  id: number;
  user_id: number;
  type: string;
  status: string;
  data: any;
}

export interface GameState {
  session: GameSession;
  team: Team;
  players: Player[];
  puzzles: Puzzle[];
}

// Game status types
export type GameStatus = 'loading' | 'waiting' | 'active' | 'eliminated' | 'gameOver' | 'countdown';

export interface GameStatusInfo {
  status: GameStatus;
  isMyTurn: boolean;
  isEliminated: boolean;
  isGameOver: boolean;
  activePlayersCount: number;
  finalStandings: Player[];
}

// WebSocket event types
export interface WebSocketEvent {
  type: 'state_update' | 'error' | 'connection_closed';
  data?: any;
  timestamp: string;
}

// Game action types
export interface GameAction {
  type: 'submit_answer' | 'fetch_puzzle' | 'connect_websocket' | 'disconnect_websocket';
  payload?: any;
}

// Game result types
export interface GameResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
} 