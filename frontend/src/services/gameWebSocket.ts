import type { GameState, WebSocketEvent } from '../types/game';

export interface WebSocketCallbacks {
  onStateUpdate: (state: GameState) => void;
  onError: (error: string) => void;
  onConnectionClosed: () => void;
  onConnected: () => void;
}

export interface WebSocketService {
  connect: (sessionId: number) => void;
  disconnect: () => void;
  isConnected: () => boolean;
  sendMessage: (message: any) => void;
}

export class GameWebSocketService implements WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;
  private sessionId: number | null = null;

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
    this.sessionId = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  sendMessage(message: any): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    } else {
      this.handleError('Cannot send message: WebSocket not connected');
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.callbacks.onConnected();
    };

    this.ws.onmessage = (event) => {
      try {
        const state: GameState = JSON.parse(event.data);
        this.callbacks.onStateUpdate(state);
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
        // Actually attempt to reconnect
        this.connect(this.sessionId!);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.callbacks.onError('Max reconnection attempts reached');
    }
  }
}

// Factory function for creating WebSocket service
export function createGameWebSocketService(callbacks: WebSocketCallbacks): WebSocketService {
  return new GameWebSocketService(callbacks);
}

// Utility function to create WebSocket event
export function createWebSocketEvent(
  type: WebSocketEvent['type'],
  data?: any
): WebSocketEvent {
  return {
    type,
    data,
    timestamp: new Date().toISOString()
  };
} 