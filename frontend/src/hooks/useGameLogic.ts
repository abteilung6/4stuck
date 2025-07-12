import { useState, useEffect, useRef, useCallback } from 'react';
import { PuzzleService } from '../api/services/PuzzleService';
import type { PuzzleState } from '../api/models/PuzzleState';
import type { PuzzleResult } from '../api/models/PuzzleResult';
import type { GameState, GameStatusInfo } from '../types/game';
import { calculateGameStatus } from '../services/gameRules';
import { createGameWebSocketService, type WebSocketCallbacks } from '../services/gameWebSocket';

export interface UseGameLogicProps {
  sessionId: number;
  userId: number;
  initialTeam: any;
}

export interface UseGameLogicReturn {
  // Game state
  gameState: GameState | null;
  puzzle: PuzzleState | null;
  gameStatus: GameStatusInfo | null;
  
  // UI state
  answer: string;
  feedback: string;
  loading: boolean;
  error: string;
  notifications: string[];
  
  // Actions
  setAnswer: (answer: string) => void;
  submitAnswer: () => Promise<void>;
  fetchPuzzle: () => Promise<void>;
  
  // Connection state
  isConnected: boolean;
}

export function useGameLogic({ sessionId, userId, initialTeam }: UseGameLogicProps): UseGameLogicReturn {
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatusInfo | null>(null);
  
  // UI state
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const wsServiceRef = useRef<ReturnType<typeof createGameWebSocketService> | null>(null);

  // WebSocket callbacks
  const wsCallbacks: WebSocketCallbacks = {
    onStateUpdate: useCallback((state: GameState) => {
      setGameState(state);
      // Calculate game status whenever state updates
      const status = calculateGameStatus(state, userId, puzzle, isConnected);
      setGameStatus(status);
    }, [userId, puzzle, isConnected]),
    
    onError: useCallback((error: string) => {
      setError(error);
      setNotifications(prev => [`WebSocket error: ${error}`, ...prev.slice(0, 4)]);
    }, []),
    
    onConnectionClosed: useCallback(() => {
      setIsConnected(false);
      setNotifications(prev => ['WebSocket closed', ...prev.slice(0, 4)]);
    }, []),
    
    onConnected: useCallback(() => {
      setIsConnected(true);
      setError('');
    }, [])
  };

  // Initialize WebSocket
  useEffect(() => {
    wsServiceRef.current = createGameWebSocketService(wsCallbacks);
    wsServiceRef.current.connect(sessionId);
    
    return () => {
      wsServiceRef.current?.disconnect();
    };
  }, [sessionId]);

  // Fetch puzzle
  const fetchPuzzle = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await PuzzleService.getCurrentPuzzlePuzzleCurrentUserIdGet(userId);
      setPuzzle(data);
    } catch (err) {
      setError('No active puzzle for you right now.');
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Submit answer
  const submitAnswer = useCallback(async () => {
    if (!puzzle) return;
    
    setLoading(true);
    setFeedback('');
    try {
      const result: PuzzleResult = await PuzzleService.submitAnswerPuzzleAnswerPost({
        puzzle_id: puzzle.id,
        answer,
      });
      
      if (result.correct) {
        setFeedback('Correct!');
      } else {
        setFeedback('Incorrect.');
      }
      
      setAnswer('');
      // Refetch puzzle (next or same)
      await fetchPuzzle();
    } catch (err) {
      setFeedback('Failed to submit answer.');
    } finally {
      setLoading(false);
    }
  }, [puzzle, answer, fetchPuzzle]);

  // Fetch puzzle on mount
  useEffect(() => {
    fetchPuzzle();
  }, [fetchPuzzle]);

  // Add timestamp to notifications
  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [
      `${message} at ${new Date().toLocaleTimeString()}`,
      ...prev.slice(0, 4)
    ]);
  }, []);

  // Update game status when dependencies change
  useEffect(() => {
    if (gameState) {
      const status = calculateGameStatus(gameState, userId, puzzle, isConnected);
      setGameStatus(status);
    }
  }, [gameState, userId, puzzle, isConnected]);

  return {
    // Game state
    gameState,
    puzzle,
    gameStatus,
    
    // UI state
    answer,
    feedback,
    loading,
    error,
    notifications,
    
    // Actions
    setAnswer,
    submitAnswer,
    fetchPuzzle,
    
    // Connection state
    isConnected
  };
} 