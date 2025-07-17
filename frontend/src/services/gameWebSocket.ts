import type { GameState, WebSocketEvent } from '../types/game';

export interface WebSocketCallbacks {
  onStateUpdate: (state: GameState) => void;
  onPuzzleInteraction: (interaction: any) => void;
  onTeamCommunication: (communication: any) => void;
  onAchievement: (achievement: any) => void;
  onError: (error: string) => void;
  onConnectionClosed: () => void;
  onConnected: () => void;
}

export interface WebSocketService {
  connect(sessionId: number): void;
  disconnect(): void;
  sendMessage(message: any): void;
  sendMousePosition(userId: number, x: number, y: number, puzzleArea?: string): void;
  sendPuzzleInteraction(userId: number, puzzleId: number, interactionType: string, interactionData?: any): void;
  sendTeamCommunication(userId: number, messageType: string, messageData?: any): void;
  sendPlayerActivity(userId: number, activityData: any): void;
  sendAchievement(userId: number, achievementType: string, achievementData?: any): void;
}

export class GameWebSocketService implements WebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private callbacks: WebSocketCallbacks;

  constructor(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  connect(sessionId: number): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.sessionId = sessionId;
    try {
      this.ws = new WebSocket(`ws://localhost:8000/ws/game/${sessionId}`);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError('Failed to create WebSocket connection');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.handleError('WebSocket is not connected');
    }
  }

  sendMousePosition(userId: number, x: number, y: number, puzzleArea?: string): void {
    this.sendMessage({
      type: 'mouse_position',
      user_id: userId,
      x: x,
      y: y,
      puzzle_area: puzzleArea
    });
  }

  sendPuzzleInteraction(userId: number, puzzleId: number, interactionType: string, interactionData?: any): void {
    this.sendMessage({
      type: 'puzzle_interaction',
      user_id: userId,
      puzzle_id: puzzleId,
      interaction_type: interactionType,
      interaction_data: interactionData || {}
    });
  }

  sendTeamCommunication(userId: number, messageType: string, messageData?: any): void {
    this.sendMessage({
      type: 'team_communication',
      user_id: userId,
      message_type: messageType,
      message_data: messageData || {}
    });
  }

  sendPlayerActivity(userId: number, activityData: any): void {
    this.sendMessage({
      type: 'player_activity',
      user_id: userId,
      activity_data: activityData
    });
  }

  sendAchievement(userId: number, achievementType: string, achievementData?: any): void {
    this.sendMessage({
      type: 'achievement',
      user_id: userId,
      achievement_type: achievementType,
      achievement_data: achievementData || {}
    });
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.callbacks.onConnected();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle different message types
        switch (message.type) {
          case 'state_update':
            this.callbacks.onStateUpdate(message.data);
            break;
          case 'puzzle_interaction':
            this.callbacks.onPuzzleInteraction(message.data);
            break;
          case 'team_communication':
            this.callbacks.onTeamCommunication(message.data);
            break;
          case 'achievement':
            this.callbacks.onAchievement(message.data);
            break;
          default:
            // Legacy support for old message format
            if (message.session && message.players) {
              this.callbacks.onStateUpdate(message);
            }
        }
      } catch (error) {
        this.handleError('Failed to parse WebSocket message');
      }
    };

    this.ws.onerror = () => {
      this.handleError('WebSocket error occurred');
    };

    this.ws.onclose = () => {
      this.callbacks.onConnectionClosed();
      this.attemptReconnect();
    };
  }

  private handleError(error: string): void {
    this.callbacks.onError(error);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.sessionId) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(this.sessionId!);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
}

export function createGameWebSocketService(callbacks: WebSocketCallbacks): WebSocketService {
  return new GameWebSocketService(callbacks);
} 