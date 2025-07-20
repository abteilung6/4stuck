import { useCallback, useRef, useEffect } from 'react';
import { 
  processGameTick,
  type GameState, 
  type GameConfig, 
  type Position 
} from '../services/spatialPuzzleLogic';

interface GameCallbacks {
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  submitAnswerWithAnswer: (answer: string) => void;
}

interface StateSetters {
  setObstaclePosition: (position: Position) => void;
  setObstacleDirection: (direction: 'left' | 'right') => void;
  setGameWon: (won: boolean) => void;
  setGameLost: (lost: boolean) => void;
}

interface UseSpatialGameLoopProps {
  gameState: GameState;
  gameConfig: GameConfig;
  callbacks: GameCallbacks;
  stateSetters: StateSetters;
  isActive: boolean;
}

export function useSpatialGameLoop({
  gameState,
  gameConfig,
  callbacks,
  stateSetters,
  isActive
}: UseSpatialGameLoopProps) {
  const animationRef = useRef<number | undefined>(undefined);
  const gameStateRef = useRef<GameState>(gameState);
  const callbacksRef = useRef<GameCallbacks>(callbacks);
  const stateSettersRef = useRef<StateSetters>(stateSetters);

  // Update refs when dependencies change
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    stateSettersRef.current = stateSetters;
  }, [stateSetters]);

  const stopGameLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  const startGameLoop = useCallback(() => {
    if (!isActive) return;
    
    const gameTick = () => {
      const currentState = gameStateRef.current;
      const currentCallbacks = callbacksRef.current;
      const currentStateSetters = stateSettersRef.current;

      // Process game tick
      const { newState, shouldEndGame, gameResult } = processGameTick(currentState, gameConfig);

      // Update state with new obstacle position and direction
      currentStateSetters.setObstaclePosition(newState.obstaclePosition);
      currentStateSetters.setObstacleDirection(newState.obstacleDirection);

      // Handle game end conditions
      if (shouldEndGame && gameResult) {
        if (gameResult.type === 'lost') {
          currentStateSetters.setGameLost(true);
          currentCallbacks.setAnswer('collision');
          currentCallbacks.submitAnswerWithAnswer('collision');
        } else if (gameResult.type === 'won') {
          currentStateSetters.setGameWon(true);
          currentCallbacks.setAnswer('solved');
          setTimeout(() => currentCallbacks.submitAnswerWithAnswer('solved'), 500);
        }
        stopGameLoop();
        return;
      }

      // Continue game loop
      animationRef.current = requestAnimationFrame(gameTick);
    };

    // Start the game loop
    animationRef.current = requestAnimationFrame(gameTick);
  }, [isActive, gameConfig, stopGameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGameLoop();
    };
  }, [stopGameLoop]);

  return {
    startGameLoop,
    stopGameLoop,
    isRunning: animationRef.current !== undefined
  };
} 