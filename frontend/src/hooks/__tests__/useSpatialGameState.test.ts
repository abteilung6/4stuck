import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useSpatialGameState } from '../useSpatialGameState';
import { getDefaultGameConfig } from '../../services/spatialPuzzleLogic';

describe('useSpatialGameState', () => {
  const defaultConfig = getDefaultGameConfig();

  it('should initialize with default game state', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result } = renderHook(() => 
      useSpatialGameState({
        gameConfig,
        puzzleType: 'spatial',
        puzzleId: 1
      })
    );

    expect(result.current.gameState.circlePosition).toEqual({ x: 180, y: 0 });
    expect(result.current.gameState.obstaclePosition).toEqual({ x: 0, y: 285 });
    expect(result.current.gameState.obstacleDirection).toBe('right');
    expect(result.current.gameState.gameWon).toBe(false);
    expect(result.current.gameState.gameLost).toBe(false);
    expect(result.current.isGameActive).toBe(true);
  });

  it('should reset state when puzzle type changes', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result, rerender } = renderHook(
      ({ puzzleType, puzzleId }) => useSpatialGameState({ gameConfig, puzzleType, puzzleId }),
      { initialProps: { puzzleType: 'spatial' as string | null, puzzleId: 1 as number | null } }
    );

    // Modify state
    act(() => {
      result.current.setCirclePosition({ x: 100, y: 200 });
      result.current.setGameWon(true);
    });

    expect(result.current.gameState.circlePosition).toEqual({ x: 100, y: 200 });
    expect(result.current.gameState.gameWon).toBe(true);

    // Change puzzle type
    rerender({ puzzleType: 'memory', puzzleId: 2 });

    // State should be reset
    expect(result.current.gameState.circlePosition).toEqual({ x: 180, y: 0 });
    expect(result.current.gameState.gameWon).toBe(false);
  });

  it('should not reset state when puzzle type is the same', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result, rerender } = renderHook(
      ({ puzzleType, puzzleId }) => useSpatialGameState({ gameConfig, puzzleType, puzzleId }),
      { initialProps: { puzzleType: 'spatial' as string | null, puzzleId: 1 as number | null } }
    );

    // Modify state
    act(() => {
      result.current.setCirclePosition({ x: 100, y: 200 });
      result.current.setGameWon(true);
    });

    expect(result.current.gameState.circlePosition).toEqual({ x: 100, y: 200 });
    expect(result.current.gameState.gameWon).toBe(true);

    // Keep same puzzle type
    rerender({ puzzleType: 'spatial', puzzleId: 1 });

    // State should not be reset
    expect(result.current.gameState.circlePosition).toEqual({ x: 100, y: 200 });
    expect(result.current.gameState.gameWon).toBe(true);
  });

  it('should update isGameActive when game ends', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result } = renderHook(() => 
      useSpatialGameState({
        gameConfig,
        puzzleType: 'spatial',
        puzzleId: 1
      })
    );

    expect(result.current.isGameActive).toBe(true);

    act(() => {
      result.current.setGameWon(true);
    });

    expect(result.current.isGameActive).toBe(false);

    act(() => {
      result.current.setGameWon(false);
      result.current.setGameLost(true);
    });

    expect(result.current.isGameActive).toBe(false);
  });

  it('should provide state setters', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result } = renderHook(() => 
      useSpatialGameState({
        gameConfig,
        puzzleType: 'spatial',
        puzzleId: 1
      })
    );

    expect(typeof result.current.setCirclePosition).toBe('function');
    expect(typeof result.current.setObstaclePosition).toBe('function');
    expect(typeof result.current.setObstacleDirection).toBe('function');
    expect(typeof result.current.setGameWon).toBe('function');
    expect(typeof result.current.setGameLost).toBe('function');
    expect(typeof result.current.resetGame).toBe('function');
  });

  it('should reset game state and increment reset counter when resetGame is called', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result } = renderHook(() => 
      useSpatialGameState({
        gameConfig,
        puzzleType: 'spatial',
        puzzleId: 1
      })
    );

    // Get initial state
    const initialState = result.current.gameState;
    const initialResetCounter = result.current.resetCounter;

    // Modify the game state to simulate a game in progress
    act(() => {
      result.current.setCirclePosition({ x: 100, y: 200 });
      result.current.setObstaclePosition({ x: 50, y: 150 });
      result.current.setGameWon(true);
    });

    // Verify state was modified
    expect(result.current.gameState.circlePosition).toEqual({ x: 100, y: 200 });
    expect(result.current.gameState.obstaclePosition).toEqual({ x: 50, y: 150 });
    expect(result.current.gameState.gameWon).toBe(true);

    // Call resetGame
    act(() => {
      result.current.resetGame();
    });

    // Verify game state was reset to initial values
    expect(result.current.gameState.circlePosition).toEqual(initialState.circlePosition);
    expect(result.current.gameState.obstaclePosition).toEqual(initialState.obstaclePosition);
    expect(result.current.gameState.obstacleDirection).toEqual(initialState.obstacleDirection);
    expect(result.current.gameState.gameWon).toBe(initialState.gameWon);
    expect(result.current.gameState.gameLost).toBe(initialState.gameLost);

    // Verify reset counter was incremented
    expect(result.current.resetCounter).toBe(initialResetCounter + 1);

    // Verify game is active again
    expect(result.current.isGameActive).toBe(true);
  });

  it('should reset state when puzzle ID changes', () => {
    const gameConfig = {
      gameWidth: 400,
      gameHeight: 600,
      circleRadius: 20,
      obstacleWidth: 80,
      obstacleHeight: 30,
      obstacleSpeed: 2
    };

    const { result, rerender } = renderHook(
      ({ puzzleType, puzzleId }) => useSpatialGameState({ gameConfig, puzzleType, puzzleId }),
      { initialProps: { puzzleType: 'spatial' as string | null, puzzleId: 82 as number | null } }
    );

    // Modify state
    act(() => {
      result.current.setCirclePosition({ x: 100, y: 200 });
      result.current.setGameWon(true);
    });

    expect(result.current.gameState.circlePosition).toEqual({ x: 100, y: 200 });
    expect(result.current.gameState.gameWon).toBe(true);

    // Change puzzle ID (same type, different puzzle)
    rerender({ puzzleType: 'spatial', puzzleId: 84 });

    // State should be reset
    expect(result.current.gameState.circlePosition).toEqual({ x: 180, y: 0 });
    expect(result.current.gameState.gameWon).toBe(false);
  });
}); 