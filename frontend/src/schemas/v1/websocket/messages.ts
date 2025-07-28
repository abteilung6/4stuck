/**
 * Auto-generated from 4stuck/schemas/websocket/v1/messages.json
 */

/** Message Type: Available WebSocket message types */
export interface MessageType {
}

/** WebSocket Message: Base structure for all WebSocket messages */
export interface WebSocketMessage {
  /** Type of message */
  type: any;
  /** When the message was sent */
  timestamp: string;
  /** Game session ID this message belongs to */
  session_id?: number;
  /** ID of the user sending the message (for incoming messages) */
  user_id?: number;
  /** Message-specific data payload */
  data?: any;
}

/** Incoming Message: Message sent from client to server */
export interface IncomingMessage {
  type: ('mouse_position' | 'puzzle_interaction' | 'ping');
  /** ID of the user sending the message */
  user_id?: number;
  /** X coordinate (for mouse_position) */
  x?: number;
  /** Y coordinate (for mouse_position) */
  y?: number;
  /** Normalized X coordinate (0-1) */
  normalized_x?: number;
  /** Normalized Y coordinate (0-1) */
  normalized_y?: number;
  /** Puzzle ID (for puzzle_interaction) */
  puzzle_id?: number;
  /** Type of puzzle interaction */
  interaction_type?: ('click' | 'drag' | 'submit' | 'timeout' | 'start' | 'complete');
  /** Additional interaction data */
  interaction_data?: Record<string, any>;
  /** Puzzle answer (for submit interaction) */
  answer?: string;
}

/** Outgoing Message: Message sent from server to client */
export interface OutgoingMessage {
  /** Type of message */
  type: any;
  /** When the message was sent */
  timestamp: string;
  /** Message-specific data payload */
  data?: any;
}

/** Mouse Position Message: Real-time mouse position broadcast */
export interface MousePositionMessage {
  type: any;
  timestamp: string;
  data: any;
}

/** Puzzle Interaction Message: Puzzle interaction broadcast */
export interface PuzzleInteractionMessage {
  type: any;
  timestamp: string;
  data: any;
}

/** State Update Message: Game state update broadcast */
export interface StateUpdateMessage {
  type: any;
  timestamp: string;
  data: any;
}

/** Game Event Message: Game event notification */
export interface GameEventMessage {
  type: any;
  timestamp: string;
  data: Record<string, any>;
}

/** Error Message: Error notification from server */
export interface ErrorMessage {
  type: any;
  timestamp: string;
  data: Record<string, any>;
}

/** Ping Message: Ping message for connection health check */
export interface PingMessage {
  type: any;
  timestamp: string;
}

/** Pong Message: Pong response to ping */
export interface PongMessage {
  type: any;
  timestamp: string;
}
