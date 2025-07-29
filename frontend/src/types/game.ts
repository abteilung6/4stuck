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
  type: 'state_update' | 'puzzle_interaction' | 'team_communication' | 'achievement' | 'error' | 'connection_closed';
  data?: any;
  timestamp: string;
}

// Enhanced player data with activity and mouse position
export interface PlayerWithActivity extends Player {
  activity?: PlayerActivity;
  mouse_position?: MousePosition;
}

// Player activity tracking
export interface PlayerActivity {
  status: 'thinking' | 'solving' | 'idle' | 'stressed' | 'focused';
  puzzle_type?: string;
  puzzle_progress?: number;
  last_interaction?: string;
  timestamp: string;
}

// Mouse position tracking
export interface MousePosition {
  x: number;
  y: number;
  puzzle_area?: string;
  timestamp: string;
}

// Puzzle interaction events
export interface PuzzleInteraction {
  user_id: number;
  puzzle_id: number;
  interaction_type: 'click' | 'drag_start' | 'drag_end' | 'hover' | 'focus' | 'blur';
  interaction_data: {
    element_id?: string;
    coordinates?: { x: number; y: number };
    target_element?: string;
    duration?: number;
    [key: string]: any;
  };
  timestamp: string;
}

// Team communication events
export interface TeamCommunication {
  user_id: number;
  message_type: 'emoji_reaction' | 'thinking' | 'stress_indicator' | 'strategy_cue' | 'encouragement';
  message_data: {
    emoji?: string;
    stress_level?: number;
    strategy_type?: string;
    message?: string;
    [key: string]: any;
  };
  timestamp: string;
}

// Achievement events
export interface Achievement {
  user_id: number;
  achievement_type: 'puzzle_solved' | 'fast_solve' | 'team_support' | 'perfect_score' | 'survival_milestone';
  achievement_data: {
    puzzle_type?: string;
    solve_time?: number;
    points_awarded?: number;
    milestone?: string;
    [key: string]: any;
  };
  timestamp: string;
}

// Enhanced game state with real-time data
export interface EnhancedGameState extends GameState {
  players: PlayerWithActivity[];
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
