import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConcentrationGameState } from '../useConcentrationGameState';
import type { ConcentrationPuzzleData } from '../../services/concentrationPuzzleLogic';

// Mock timers
vi.useFakeTimers();

describe('useConcentrationGameState', () => {
  const mockPuzzleData: ConcentrationPuzzleData = {
    pairs: [
      { color_word: 'red', circle_color: 'blue', is_match: false },
      { color_word: 'blue', circle_color: 'blue', is_match: true },
      { color_word: 'green', circle_color: 'red', is_match: false }
    ],
    duration: 2
  };

  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with default game state', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    expect(result.current.gameState.currentIndex).toBe(0);
    expect(result.current.gameState.hasClicked).toBe(false);
    expect(result.current.gameState.isComplete).toBe(false);
    expect(result.current.gameState.gameResult).toBe(null);
    expect(result.current.gameState.clickedIndex).toBe(null);
    expect(result.current.isGameActive).toBe(true);
    expect(result.current.currentPair).toEqual(mockPuzzleData.pairs[0]);
  });

  it('should reset state when puzzle type changes', () => {
    const { result, rerender } = renderHook(
      ({ puzzleType, puzzleId }) => useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType,
        puzzleId
      }),
      { initialProps: { puzzleType: 'concentration' as string | null, puzzleId: 1 as number | null } }
    );

    // Modify state
    act(() => {
      result.current.handleClick();
    });

    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);

    // Change puzzle type
    rerender({ puzzleType: 'memory', puzzleId: 2 });

    // State should be reset
    expect(result.current.gameState.currentIndex).toBe(0);
    expect(result.current.gameState.hasClicked).toBe(false);
    expect(result.current.gameState.isComplete).toBe(false);
    expect(result.current.gameState.gameResult).toBe(null);
    expect(result.current.gameState.clickedIndex).toBe(null);
  });

  it('should reset state when puzzle ID changes', () => {
    const { result, rerender } = renderHook(
      ({ puzzleType, puzzleId }) => useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType,
        puzzleId
      }),
      { initialProps: { puzzleType: 'concentration' as string | null, puzzleId: 82 as number | null } }
    );

    // Modify state
    act(() => {
      result.current.handleClick();
    });

    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);

    // Change puzzle ID (same type, different puzzle)
    rerender({ puzzleType: 'concentration', puzzleId: 84 });

    // State should be reset
    expect(result.current.gameState.currentIndex).toBe(0);
    expect(result.current.gameState.hasClicked).toBe(false);
    expect(result.current.gameState.isComplete).toBe(false);
    expect(result.current.gameState.gameResult).toBe(null);
    expect(result.current.gameState.clickedIndex).toBe(null);
  });

  it('should not reset state when puzzle type and ID are the same', () => {
    const { result, rerender } = renderHook(
      ({ puzzleType, puzzleId }) => useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType,
        puzzleId
      }),
      { initialProps: { puzzleType: 'concentration' as string | null, puzzleId: 1 as number | null } }
    );

    // Modify state
    act(() => {
      result.current.handleClick();
    });

    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);

    // Keep same puzzle type and ID
    rerender({ puzzleType: 'concentration', puzzleId: 1 });

    // State should not be reset
    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);
  });

  it('should handle click correctly', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    expect(result.current.gameState.hasClicked).toBe(false);
    expect(result.current.gameState.isComplete).toBe(false);

    act(() => {
      result.current.handleClick();
    });

    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);
    expect(result.current.gameState.gameResult).toBe('failure'); // First pair is not a match
    expect(result.current.gameState.clickedIndex).toBe(0);
  });

  it('should handle correct click', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    // Advance to the matching pair (index 1)
    act(() => {
      result.current.gameState.currentIndex = 1;
    });

    act(() => {
      result.current.handleClick();
    });

    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);
    expect(result.current.gameState.gameResult).toBe('success');
    expect(result.current.gameState.clickedIndex).toBe(1);
  });

  it('should not allow multiple clicks', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    act(() => {
      result.current.handleClick();
    });

    const firstClickState = { ...result.current.gameState };

    act(() => {
      result.current.handleClick();
    });

    // State should not change after second click
    expect(result.current.gameState).toEqual(firstClickState);
  });

  it('should auto-advance pairs after duration', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    expect(result.current.gameState.currentIndex).toBe(0);

    // Advance time by duration
    act(() => {
      vi.advanceTimersByTime(2000); // 2 seconds
    });

    expect(result.current.gameState.currentIndex).toBe(1);
  });

  it('should complete game when reaching end without click', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    // Advance to last pair
    act(() => {
      result.current.gameState.currentIndex = 2;
    });

    // Advance time to trigger auto-advance
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.gameState.isComplete).toBe(true);
    expect(result.current.gameState.gameResult).toBe('failure');
    expect(result.current.gameState.clickedIndex).toBe(null);
  });

  it('should not auto-advance after click', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    act(() => {
      result.current.handleClick();
    });

    const stateAfterClick = { ...result.current.gameState };

    // Advance time
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // State should not change
    expect(result.current.gameState).toEqual(stateAfterClick);
  });

  it('should increment reset counter when resetGame is called', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    const initialResetCounter = result.current.resetCounter;

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.resetCounter).toBe(initialResetCounter + 1);
  });

  it('should reset game state when resetGame is called', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    // Modify state
    act(() => {
      result.current.handleClick();
    });

    expect(result.current.gameState.hasClicked).toBe(true);
    expect(result.current.gameState.isComplete).toBe(true);

    // Reset game
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.currentIndex).toBe(0);
    expect(result.current.gameState.hasClicked).toBe(false);
    expect(result.current.gameState.isComplete).toBe(false);
    expect(result.current.gameState.gameResult).toBe(null);
    expect(result.current.gameState.clickedIndex).toBe(null);
  });

  it('should update currentPair when advancing', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    expect(result.current.currentPair).toEqual(mockPuzzleData.pairs[0]);

    // Advance to next pair
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.currentPair).toEqual(mockPuzzleData.pairs[1]);
  });

  it('should return null currentPair when game is complete', () => {
    const { result } = renderHook(() => 
      useConcentrationGameState({
        puzzleData: mockPuzzleData,
        puzzleType: 'concentration',
        puzzleId: 1
      })
    );

    // Complete the game by clicking (which sets isComplete to true)
    act(() => {
      result.current.handleClick();
    });

    // After clicking, the game should be complete and currentPair should be null
    expect(result.current.gameState.isComplete).toBe(true);
    expect(result.current.currentPair).toBeNull();
  });
}); 