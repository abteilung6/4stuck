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
      console.log('[useGameLogic] Received state update:', state.session.status);
      setGameState(state);
      // Clear any previous errors when we receive a valid state update
      setError('');
      // Do NOT setGameStatus here! Let the effect handle it.
    }, []),
    
    onPuzzleInteraction: useCallback((interaction: any) => {
      console.log('[useGameLogic] Received puzzle interaction:', interaction);
      // Handle puzzle interaction events (e.g., show teammate activity)
      setNotifications(prev => [`Teammate interaction: ${interaction.interaction_type}`, ...prev.slice(0, 4)]);
    }, []),
    
    onTeamCommunication: useCallback((communication: any) => {
      console.log('[useGameLogic] Received team communication:', communication);
      // Handle team communication events (e.g., emoji reactions, stress indicators)
      setNotifications(prev => [`Team message: ${communication.message_type}`, ...prev.slice(0, 4)]);
    }, []),
    
    onAchievement: useCallback((achievement: any) => {
      console.log('[useGameLogic] Received achievement:', achievement);
      // Handle achievement events (e.g., puzzle solved, fast solve)
      setNotifications(prev => [`Achievement: ${achievement.achievement_type}`, ...prev.slice(0, 4)]);
    }, []),
    
    onError: useCallback((error: string) => {
      console.error('[useGameLogic] WebSocket error:', error);
      setError(error);
      setNotifications(prev => [`WebSocket error: ${error}`, ...prev.slice(0, 4)]);
    }, []),
    
    onConnectionClosed: useCallback(() => {
      console.log('[useGameLogic] WebSocket connection closed');
      setIsConnected(false);
      setNotifications(prev => ['WebSocket connection lost', ...prev.slice(0, 4)]);
    }, []),
    
    onConnected: useCallback(() => {
      console.log('[useGameLogic] WebSocket connected');
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
      console.log('[fetchPuzzle] Got puzzle:', data?.id, data?.type);
      setPuzzle(data);
    } catch (err) {
      // If no puzzle exists and we're in an active game, retry a few times
      if (retryCount < 3 && gameState?.session?.status === 'active') {
        console.log(`[fetchPuzzle] No puzzle found, retrying in 0.5s... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => fetchPuzzle(retryCount + 1), 500);
        return;
      }
      
      // If no puzzle exists, wait for the backend to create one
      console.log('[fetchPuzzle] No puzzle found, waiting for backend to create initial puzzle...');
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
  }, [puzzle, answer, fetchPuzzle]);

  // Submit answer with specific answer value
  const isSubmittingRef = React.useRef(false);
  const submitAnswerWithAnswer = useCallback(async (specificAnswer: string) => {
    if (!puzzle) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setFeedback('');
    try {
      console.log('[submitAnswerWithAnswer] Submitting answer for puzzle', puzzle.id, puzzle.type, 'answer:', specificAnswer);
      const result: PuzzleResult = await PuzzleService.submitAnswerPuzzleAnswerPost({
        puzzle_id: puzzle.id,
        answer: specificAnswer,
      });
      console.log('[submitAnswerWithAnswer] Result:', result);
      if (result.correct) {
        setFeedback('Correct!');
        console.log('[submitAnswerWithAnswer] Answer was correct, result:', result);
        if (result.next_puzzle) {
          console.log('[submitAnswerWithAnswer] Setting next puzzle from response:', result.next_puzzle);
          setPuzzle(result.next_puzzle);
          console.log('[submitAnswerWithAnswer] Next puzzle set successfully');
        } else {
          console.log('[submitAnswerWithAnswer] No next puzzle in response, fetching...');
          await fetchPuzzle();
        }
      } else {
        setFeedback('Incorrect.');
        console.log('[submitAnswerWithAnswer] Answer was incorrect, result:', result);
        if (result.next_puzzle) {
          console.log('[submitAnswerWithAnswer] Setting next puzzle from failed response:', result.next_puzzle);
          setPuzzle(result.next_puzzle);
          console.log('[submitAnswerWithAnswer] Next puzzle set successfully (from failed response)');
        } else {
          console.log('[submitAnswerWithAnswer] No next puzzle in response, fetching...');
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
  }, [puzzle, fetchPuzzle]);

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
        console.log('[useGameLogic] Game became active, fetching puzzle...');
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