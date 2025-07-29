import { useState, useEffect, useRef } from 'react';

export interface MemoryGameState {
  showMapping: boolean;
  timeLeft: number;
  isComplete: boolean;
}

export interface UseMemoryGameStateOptions {
  puzzleId?: number;
  mappingDuration?: number;
  onMappingComplete?: () => void;
}

export const useMemoryGameState = ({
  puzzleId,
  mappingDuration = 5,
  onMappingComplete,
}: UseMemoryGameStateOptions = {}): MemoryGameState => {
  const [showMapping, setShowMapping] = useState(true);
  const [timeLeft, setTimeLeft] = useState(mappingDuration);
  const [isComplete, setIsComplete] = useState(false);
  const lastPuzzleId = useRef<number | undefined>(undefined);
  const lastMappingDuration = useRef<number>(mappingDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompleted = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  // Reset state when puzzle changes or mapping duration changes
  useEffect(() => {
    const shouldReset =
      puzzleId !== lastPuzzleId.current ||
      mappingDuration !== lastMappingDuration.current;

    if (shouldReset) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setShowMapping(true);
      setTimeLeft(mappingDuration);
      setIsComplete(false);
      hasCompleted.current = false;
      lastPuzzleId.current = puzzleId;
      lastMappingDuration.current = mappingDuration;
      startTimeRef.current = Date.now();
    }
  }, [puzzleId, mappingDuration]);

  // Handle immediate completion for zero or negative duration
  useEffect(() => {
    if (mappingDuration <= 0 && !hasCompleted.current) {
      setShowMapping(false);
      setTimeLeft(mappingDuration); // Allow negative values
      setIsComplete(true);
      hasCompleted.current = true;
      onMappingComplete?.();
    }
  }, [mappingDuration, onMappingComplete]);

  // Timer logic for mapping phase
  useEffect(() => {
    // Don't start timer if already complete, not showing mapping, or duration is invalid
    if (hasCompleted.current || !showMapping || mappingDuration <= 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, mappingDuration - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 0 && !hasCompleted.current) {
        setShowMapping(false);
        setIsComplete(true);
        hasCompleted.current = true;
        onMappingComplete?.();
        return;
      }

      // Schedule next update
      if (remaining > 0) {
        timerRef.current = setTimeout(updateTimer, 1000);
      }
    };

    // Start the timer
    timerRef.current = setTimeout(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showMapping, mappingDuration, onMappingComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    showMapping,
    timeLeft,
    isComplete,
  };
};
