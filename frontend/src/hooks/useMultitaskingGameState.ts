import { useState, useEffect, useCallback, useRef } from 'react';
import type { MultitaskingPuzzleData } from '../utils/multitaskingPuzzleUtils';
import { generateNumberGrid, checkWinCondition } from '../utils/multitaskingPuzzleUtils';

export interface MultitaskingGameState {
  puzzleData: MultitaskingPuzzleData | null;
  grid: string[][];
  foundPositions: number[];
  timeRemaining: number;
  isComplete: boolean;
  isTimeUp: boolean;
  progress: number; // 0 to 100
}

export const useMultitaskingGameState = (
  puzzleData: MultitaskingPuzzleData | null,
  onComplete: (foundPositions: number[]) => void,
  onTimeUp: () => void
) => {
  const [state, setState] = useState<MultitaskingGameState>({
    puzzleData: null,
    grid: [],
    foundPositions: [],
    timeRemaining: 0,
    isComplete: false,
    isTimeUp: false,
    progress: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const puzzleDataRef = useRef<MultitaskingPuzzleData | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTimeUpRef = useRef(onTimeUp);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTimeUpRef.current = onTimeUp;
  }, [onComplete, onTimeUp]);

  // Clear timer helper
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize puzzle when data changes
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!puzzleData) {
      setState({
        puzzleData: null,
        grid: [],
        foundPositions: [],
        timeRemaining: 0,
        isComplete: false,
        isTimeUp: false,
        progress: 0
      });
      puzzleDataRef.current = null;
      return;
    }

    const grid = generateNumberGrid(puzzleData);
    setState({
      puzzleData,
      grid,
      foundPositions: [],
      timeRemaining: puzzleData.timeLimit,
      isComplete: false,
      isTimeUp: false,
      progress: 0
    });

    // Start timer
    startTimeRef.current = Date.now();
    puzzleDataRef.current = puzzleData;

    const updateTimer = () => {
      const currentPuzzleData = puzzleDataRef.current;
      if (!currentPuzzleData) {
        return;
      }

      setState(prev => {
        if (prev.isComplete || prev.isTimeUp) {
          return prev;
        }

        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, currentPuzzleData.timeLimit - elapsed);

        if (remaining <= 0) {
          // Time's up
          onTimeUpRef.current();
          return {
            ...prev,
            timeRemaining: 0,
            isTimeUp: true
          };
        }

        // Schedule next update
        timerRef.current = setTimeout(updateTimer, 1000);

        return {
          ...prev,
          timeRemaining: remaining
        };
      });
    };

    timerRef.current = setTimeout(updateTimer, 1000);
  }, [puzzleData]); // Removed clearTimer from dependencies

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []); // No dependencies needed for cleanup

  const handleDigitClick = useCallback((rowIndex: number, colIndex: number) => {
    setState(prev => {
      if (!prev.puzzleData || prev.isComplete || prev.isTimeUp) {
        return prev;
      }

      const newFoundPositions = [...prev.foundPositions];
      
      // Check if this position is already found
      const existingIndex = newFoundPositions.findIndex((_, index) => index === rowIndex);
      
      if (existingIndex >= 0) {
        // Already found a 6 in this row, replace it
        newFoundPositions[rowIndex] = colIndex;
      } else {
        // First 6 found in this row
        newFoundPositions[rowIndex] = colIndex;
      }

      // Check if all 6s are found
      const isComplete = checkWinCondition(newFoundPositions, prev.puzzleData);
      const progress = (newFoundPositions.length / prev.puzzleData.rows) * 100;

      const newState = {
        ...prev,
        foundPositions: newFoundPositions,
        isComplete,
        progress
      };

      if (isComplete) {
        // Stop the timer when game is complete
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        onCompleteRef.current(newFoundPositions);
      }

      return newState;
    });
  }, []); // No dependencies needed

  const resetGame = useCallback(() => {
    const currentPuzzleData = puzzleDataRef.current;
    if (!currentPuzzleData) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const grid = generateNumberGrid(currentPuzzleData);
    setState({
      puzzleData: currentPuzzleData,
      grid,
      foundPositions: [],
      timeRemaining: currentPuzzleData.timeLimit,
      isComplete: false,
      isTimeUp: false,
      progress: 0
    });

    // Restart timer
    startTimeRef.current = Date.now();

    const updateTimer = () => {
      const currentPuzzleData = puzzleDataRef.current;
      if (!currentPuzzleData) {
        return;
      }

      setState(prev => {
        if (prev.isComplete || prev.isTimeUp) {
          return prev;
        }

        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, currentPuzzleData.timeLimit - elapsed);

        if (remaining <= 0) {
          // Time's up
          onTimeUpRef.current();
          return {
            ...prev,
            timeRemaining: 0,
            isTimeUp: true
          };
        }

        // Schedule next update
        timerRef.current = setTimeout(updateTimer, 1000);

        return {
          ...prev,
          timeRemaining: remaining
        };
      });
    };

    timerRef.current = setTimeout(updateTimer, 1000);
  }, []); // No dependencies needed

  return {
    ...state,
    handleDigitClick,
    resetGame
  };
}; 