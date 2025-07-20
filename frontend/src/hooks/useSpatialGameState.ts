import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  type GameState,
  type GameConfig,
  getInitialGameState
} from '../services/spatialPuzzleLogic';

interface UseSpatialGameStateProps {
  gameConfig: GameConfig;
  puzzleType: string | null;
  puzzleId: number | null;
}

export function useSpatialGameState({
  gameConfig,
  puzzleType,
  puzzleId
}: UseSpatialGameStateProps) {
  const [lastPuzzleType, setLastPuzzleType] = useState<string | null>(null);
  const [lastPuzzleId, setLastPuzzleId] = useState<number | null>(null);
  const [resetCounter, setResetCounter] = useState(0);
  
  // Get initial state
  const initialGameState = useMemo(() => getInitialGameState(gameConfig), [gameConfig]);
  
  // Game state
  const [circlePosition, setCirclePosition] = useState<GameState['circlePosition']>(initialGameState.circlePosition);
  const [obstaclePosition, setObstaclePosition] = useState<GameState['obstaclePosition']>(initialGameState.obstaclePosition);
  const [obstacleDirection, setObstacleDirection] = useState<GameState['obstacleDirection']>(initialGameState.obstacleDirection);
  const [gameWon, setGameWon] = useState<GameState['gameWon']>(initialGameState.gameWon);
  const [gameLost, setGameLost] = useState<GameState['gameLost']>(initialGameState.gameLost);

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
    setCirclePosition(initialGameState.circlePosition);
    setObstaclePosition(initialGameState.obstaclePosition);
    setObstacleDirection(initialGameState.obstacleDirection);
    setGameWon(initialGameState.gameWon);
    setGameLost(initialGameState.gameLost);
  }, [initialGameState]);

  // Computed game state
  const gameState: GameState = useMemo(() => ({
    circlePosition,
    obstaclePosition,
    obstacleDirection,
    gameWon,
    gameLost
  }), [circlePosition, obstaclePosition, obstacleDirection, gameWon, gameLost]);

  // Game is active when not won and not lost
  const isGameActive = useMemo(() => !gameWon && !gameLost, [gameWon, gameLost]);

  return {
    gameState,
    isGameActive,
    resetCounter,
    setCirclePosition,
    setObstaclePosition,
    setObstacleDirection,
    setGameWon,
    setGameLost,
    resetGame
  };
} 