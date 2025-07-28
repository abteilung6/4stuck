import { useState, useEffect, useRef, useCallback } from 'react';
import { PuzzleService } from '../api/services/PuzzleService';
import type { PuzzleState } from '../api/models/PuzzleState';
import type { PuzzleResult } from '../api/models/PuzzleResult';
import type { GameState, GameStatusInfo } from '../types/game';
import { calculateGameStatus } from '../services/gameRules';
import { createGameWebSocketService, type WebSocketCallbacks } from '../services/gameWebSocket';
import React from 'react';

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
  submitAnswerWithAnswer: (answer: string) => Promise<void>;
  fetchPuzzle: () => Promise<void>;
  
  // Connection state
  isConnected: boolean;
  websocket: WebSocket | null;
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
      // Clear any previous errors when we receive a valid state update
      setError('');
      // Do NOT setGameStatus here! Let the effect handle it.
    }, []),
    
    onPuzzleInteraction: useCallback((interaction: any) => {
      setNotifications(prev => [`Teammate interaction: ${interaction.interaction_type}`, ...prev.slice(0, 4)]);
    }, []),
    
    onTeamCommunication: useCallback((communication: any) => {
      setNotifications(prev => [`Team message: ${communication.message_type}`, ...prev.slice(0, 4)]);
    }, []),
    
    onAchievement: useCallback((achievement: any) => {
      setNotifications(prev => [`Achievement: ${achievement.achievement_type}`, ...prev.slice(0, 4)]);
    }, []),
    
    onError: useCallback((error: string) => {
      setError(error);
      setNotifications(prev => [`WebSocket error: ${error}`, ...prev.slice(0, 4)]);
    }, []),
    
    onConnectionClosed: useCallback(() => {
      setIsConnected(false);
      setNotifications(prev => ['WebSocket connection lost', ...prev.slice(0, 4)]);
    }, []),
    
    onConnected: useCallback(() => {
      setIsConnected(true);
      setError('');
      setNotifications(prev => ['Connected to game server', ...prev.slice(0, 4)]);
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

  // Fetch puzzle with retry for initial puzzle creation
  const fetchPuzzle = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await PuzzleService.getCurrentPuzzlePuzzleCurrentUserIdGet(userId);
      setPuzzle(data);
    } catch (err) {
      // If no puzzle exists and we're in an active game, retry a few times
      if (retryCount < 3 && gameState?.session?.status === 'active') {
        setTimeout(() => fetchPuzzle(retryCount + 1), 500);
        return;
      }
      
      // If no puzzle exists, wait for the backend to create one
      setPuzzle(null);
      // Don't set error - this is expected when game first starts
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId, gameState?.session?.status]);

  // Submit answer
  const submitAnswer = useCallback(async () => {
    if (!puzzle) return;
    
    setLoading(true);
    setFeedback('');
    try {
      const result: PuzzleResult = await PuzzleService.submitAnswerPuzzleAnswerPost({
        puzzle_id: puzzle.id,
        answer,
        user_id: userId,
      });
      
      if (result.correct) {
        setFeedback('Correct!');
      } else {
        setFeedback('Incorrect.');
      }
      
      setAnswer('');
      // Refetch puzzle (next or same)
      await fetchPuzzle();
    } catch (err: any) {
      // Handle specific error for out of points
      if (err?.response?.status === 400 && err?.response?.data?.detail?.includes('out of points')) {
        setFeedback('You are out of points! Wait for your teammates to solve puzzles to receive points.');
        setError('You are out of points and cannot submit answers.');
      } else {
        setFeedback('Failed to submit answer.');
      }
    } finally {
      setLoading(false);
    }
  }, [puzzle, answer, fetchPuzzle, userId]);

  // Submit answer with specific answer value
  const isSubmittingRef = React.useRef(false);
  const lastSubmissionTimeRef = useRef(0);
  const submitAnswerWithAnswer = useCallback(async (specificAnswer: string) => {
    if (!puzzle) return;
    if (isSubmittingRef.current) return;
    
    // Rate limiting: prevent submissions more frequent than 1 second apart
    const now = Date.now();
    if (now - lastSubmissionTimeRef.current < 1000) {
      return;
    }
    
    // Validate answer format based on puzzle type
    if (puzzle.type === 'spatial' && specificAnswer !== 'solved' && specificAnswer !== 'collision') {
      return;
    }
    
    if (puzzle.type === 'multitasking' && !/^\d+(,\d+)*$/.test(specificAnswer) && specificAnswer !== '') {
      return;
    }
    
    if (puzzle.type === 'concentration' && !/^\d+$/.test(specificAnswer)) {
      return;
    }
    
    if (puzzle.type === 'memory' && !['red', 'blue', 'green', 'yellow'].includes(specificAnswer)) {
      return;
    }
    
    isSubmittingRef.current = true;
    lastSubmissionTimeRef.current = now;
    setLoading(true);
    setFeedback('');
    try {
      const result: PuzzleResult = await PuzzleService.submitAnswerPuzzleAnswerPost({
        puzzle_id: puzzle.id,
        answer: specificAnswer,
        user_id: userId,
      });
      if (result.correct) {
        setFeedback('Correct!');
        if (result.next_puzzle) {
          setPuzzle(result.next_puzzle);
        } else {
          await fetchPuzzle();
        }
      } else {
        setFeedback('Incorrect.');
        if (result.next_puzzle) {
          setPuzzle(result.next_puzzle);
        } else {
          await fetchPuzzle();
        }
      }
      setAnswer('');
    } catch (err: any) {
      console.error('[submitAnswerWithAnswer] Error:', err);
      if (err?.response?.status === 400 && err?.response?.data?.detail?.includes('out of points')) {
        setFeedback('You are out of points! Wait for your teammates to solve puzzles to receive points.');
        setError('You are out of points and cannot submit answers.');
      } else {
        setFeedback('Failed to submit answer.');
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [puzzle, fetchPuzzle, userId]);

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

  // Update game status when dependencies change (but not when puzzle changes to avoid remounting)
  useEffect(() => {
    if (gameState) {
      const status = calculateGameStatus(gameState, userId, puzzle, isConnected);
      setGameStatus(status);
      
      // If game just became active and we don't have a puzzle, fetch it
      if (gameState.session.status === 'active' && !puzzle && status.status === 'waiting') {
        fetchPuzzle();
      }
    } else {
      setGameStatus(null);
    }
  }, [gameState, userId, isConnected, puzzle, fetchPuzzle]); // Removed puzzle from dependencies

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
    submitAnswerWithAnswer,
    fetchPuzzle,
    
    // Connection state
    isConnected,
    websocket: wsServiceRef.current?.getWebSocket() || null
  };
} 