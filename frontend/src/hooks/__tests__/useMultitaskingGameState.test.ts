import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultitaskingGameState } from '../useMultitaskingGameState';
import type { MultitaskingPuzzleData } from '../../utils/multitaskingPuzzleUtils';

describe('useMultitaskingGameState', () => {
  const mockPuzzleData: MultitaskingPuzzleData = {
    rows: 3,
    digitsPerRow: 9,
    timeLimit: 10,
    sixPositions: [2, 5, 7]
  };

  const mockOnComplete = vi.fn();
  const mockOnTimeUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    expect(result.current.puzzleData).toEqual(mockPuzzleData);
    expect(result.current.grid).toHaveLength(3);
    expect(result.current.grid[0]).toHaveLength(9);
    expect(result.current.foundPositions).toEqual([]);
    expect(result.current.timeRemaining).toBe(10);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isTimeUp).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('should handle null puzzle data', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(null, mockOnComplete, mockOnTimeUp)
    );

    expect(result.current.puzzleData).toBeNull();
    expect(result.current.grid).toEqual([]);
    expect(result.current.foundPositions).toEqual([]);
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isTimeUp).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('should handle digit clicks correctly', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    // Click on a 6 in the first row
    act(() => {
      result.current.handleDigitClick(0, 2); // Position 2 in row 0
    });

    expect(result.current.foundPositions).toEqual([2]);
    expect(result.current.progress).toBeCloseTo(33.33, 1);
    expect(result.current.isComplete).toBe(false);

    // Click on a 6 in the second row
    act(() => {
      result.current.handleDigitClick(1, 5); // Position 5 in row 1
    });

    expect(result.current.foundPositions).toEqual([2, 5]);
    expect(result.current.progress).toBeCloseTo(66.67, 1);
    expect(result.current.isComplete).toBe(false);

    // Click on a 6 in the third row
    act(() => {
      result.current.handleDigitClick(2, 7); // Position 7 in row 2
    });

    expect(result.current.foundPositions).toEqual([2, 5, 7]);
    expect(result.current.progress).toBe(100);
    expect(result.current.isComplete).toBe(true);
    expect(mockOnComplete).toHaveBeenCalledWith([2, 5, 7]);
  });

  it('should allow replacing found positions', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    // Click on wrong position in first row
    act(() => {
      result.current.handleDigitClick(0, 1); // Wrong position
    });

    expect(result.current.foundPositions).toEqual([1]);
    expect(result.current.isComplete).toBe(false);

    // Click on correct position in first row (should replace)
    act(() => {
      result.current.handleDigitClick(0, 2); // Correct position
    });

    expect(result.current.foundPositions).toEqual([2]);
    expect(result.current.isComplete).toBe(false);
  });

  it('should not allow clicks when game is complete', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    // Complete the game
    act(() => {
      result.current.handleDigitClick(0, 2);
      result.current.handleDigitClick(1, 5);
      result.current.handleDigitClick(2, 7);
    });

    expect(result.current.isComplete).toBe(true);

    // Try to click again
    act(() => {
      result.current.handleDigitClick(0, 0);
    });

    // Should not change the found positions
    expect(result.current.foundPositions).toEqual([2, 5, 7]);
  });

  it('should handle timer countdown', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    expect(result.current.timeRemaining).toBe(10);

    // Advance time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeRemaining).toBe(7);

    // Advance time to 0
    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.isTimeUp).toBe(true);
    expect(mockOnTimeUp).toHaveBeenCalled();
  });

  it('should stop timer when game is complete', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    // Complete the game
    act(() => {
      result.current.handleDigitClick(0, 2);
      result.current.handleDigitClick(1, 5);
      result.current.handleDigitClick(2, 7);
    });

    expect(result.current.isComplete).toBe(true);
    const timeWhenComplete = result.current.timeRemaining;

    // Advance time - should not trigger time up
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    // Time should remain the same when game is complete
    expect(result.current.timeRemaining).toBe(timeWhenComplete);
    expect(result.current.isTimeUp).toBe(false);
    expect(mockOnTimeUp).not.toHaveBeenCalled();
  });

  it('should reset game correctly', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    // Make some progress
    act(() => {
      result.current.handleDigitClick(0, 2);
      result.current.handleDigitClick(1, 5);
    });

    expect(result.current.foundPositions).toEqual([2, 5]);
    expect(result.current.progress).toBeCloseTo(66.67, 1);

    // Reset the game
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.foundPositions).toEqual([]);
    expect(result.current.progress).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isTimeUp).toBe(false);
    expect(result.current.timeRemaining).toBe(10);
  });

  it('should handle null puzzle data in reset', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(null, mockOnComplete, mockOnTimeUp)
    );

    // Reset should not crash
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.puzzleData).toBeNull();
  });

  it('should generate correct grid with 6s in right positions', () => {
    const { result } = renderHook(() =>
      useMultitaskingGameState(mockPuzzleData, mockOnComplete, mockOnTimeUp)
    );

    const grid = result.current.grid;

    // Check that 6s are in the correct positions
    expect(grid[0][2]).toBe('6'); // Row 0, position 2
    expect(grid[1][5]).toBe('6'); // Row 1, position 5
    expect(grid[2][7]).toBe('6'); // Row 2, position 7

    // Check that other positions are 9s
    expect(grid[0][0]).toBe('9');
    expect(grid[0][1]).toBe('9');
    expect(grid[0][3]).toBe('9');
    expect(grid[1][0]).toBe('9');
    expect(grid[1][4]).toBe('9');
    expect(grid[1][6]).toBe('9');
    expect(grid[2][0]).toBe('9');
    expect(grid[2][6]).toBe('9');
    expect(grid[2][8]).toBe('9');
  });
});
