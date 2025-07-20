import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type ConcentrationGameState,
  type ConcentrationPuzzleData,
  getInitialConcentrationGameState,
  processClick,
  advanceToNextPair,
  shouldAutoAdvance,
  getCurrentPair
} from '../services/concentrationPuzzleLogic';

interface UseConcentrationGameStateProps {
  puzzleData: ConcentrationPuzzleData;
  puzzleType: string | null;
  puzzleId: number | null;
}

interface UseConcentrationGameStateReturn {
  gameState: ConcentrationGameState;
  currentPair: ReturnType<typeof getCurrentPair>;
  isGameActive: boolean;
  resetGame: () => void;
  resetCounter: number;
  handleClick: () => void;
}

export function useConcentrationGameState({
  puzzleData,
  puzzleType,
  puzzleId
}: UseConcentrationGameStateProps): UseConcentrationGameStateReturn {
  const [lastPuzzleType, setLastPuzzleType] = useState<string | null>(null);
  const [lastPuzzleId, setLastPuzzleId] = useState<number | null>(null);
  const [resetCounter, setResetCounter] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<ConcentrationGameState>(getInitialConcentrationGameState());

  // Reset game state when puzzle type or puzzle ID changes
  useEffect(() => {
    if (puzzleType !== lastPuzzleType || puzzleId !== lastPuzzleId) {
      setLastPuzzleType(puzzleType);
      setLastPuzzleId(puzzleId);
      resetGameState();
    }
  }, [puzzleType, puzzleId, lastPuzzleType, lastPuzzleId]);

  // Reset function that can be called manually
  const resetGame = useCallback(() => {
    resetGameState();
    setResetCounter(prev => prev + 1);
  }, []);

  // Helper function to reset game state
  const resetGameState = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setGameState(getInitialConcentrationGameState());
  }, []);

  // Auto-advance timer effect
  useEffect(() => {
    if (!shouldAutoAdvance(gameState, puzzleData.pairs.length)) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setGameState(prevState => advanceToNextPair(prevState, puzzleData.pairs.length));
    }, puzzleData.duration * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.currentIndex, gameState.hasClicked, gameState.isComplete, puzzleData.pairs.length, puzzleData.duration]);

  // Cleanup timer when component unmounts or puzzle changes
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Handle click event
  const handleClick = useCallback(() => {
    if (gameState.hasClicked || gameState.isComplete) {
      return;
    }

    // Clear the timer immediately when clicked
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const { newState } = processClick(gameState, puzzleData.pairs);
    setGameState(newState);
  }, [gameState, puzzleData.pairs]);

  // Computed values
  const currentPair = getCurrentPair(gameState, puzzleData.pairs);
  const isGameActive = !gameState.isComplete;

  return {
    gameState,
    currentPair,
    isGameActive,
    resetGame,
    resetCounter,
    handleClick
  };
} 