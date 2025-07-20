import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMemoryGameState } from '../useMemoryGameState';

// Mock timers
vi.useFakeTimers();

describe('useMemoryGameState', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useMemoryGameState());

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
      expect(result.current.isComplete).toBe(false);
    });

    it('should initialize with custom mapping duration', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ mappingDuration: 10 })
      );

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(10);
      expect(result.current.isComplete).toBe(false);
    });

    it('should initialize with puzzle ID', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ puzzleId: 123 })
      );

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('Timer Functionality', () => {
    it('should countdown timer every second', () => {
      const { result } = renderHook(() => useMemoryGameState());

      expect(result.current.timeLeft).toBe(5);

      // Advance timer by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(4);

      // Advance timer by another second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(3);
    });

    it('should complete mapping phase when timer reaches zero', () => {
      const onMappingComplete = vi.fn();
      const { result } = renderHook(() => 
        useMemoryGameState({ onMappingComplete })
      );

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);

      // Advance timer to complete countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.showMapping).toBe(false);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isComplete).toBe(true);
      expect(onMappingComplete).toHaveBeenCalledTimes(1);
    });

    it('should handle custom mapping duration correctly', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ mappingDuration: 3 })
      );

      expect(result.current.timeLeft).toBe(3);

      // Advance timer to complete countdown
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.showMapping).toBe(false);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Puzzle ID Changes', () => {
    it('should reset state when puzzle ID changes', () => {
      const { result, rerender } = renderHook(
        ({ puzzleId }) => useMemoryGameState({ puzzleId }),
        { initialProps: { puzzleId: 1 } }
      );

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);

      // Advance timer partially
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(3);

      // Change puzzle ID
      rerender({ puzzleId: 2 });

      // State should reset
      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
      expect(result.current.isComplete).toBe(false);
    });

    it('should not reset state when puzzle ID remains the same', () => {
      const { result, rerender } = renderHook(
        ({ puzzleId }) => useMemoryGameState({ puzzleId }),
        { initialProps: { puzzleId: 1 } }
      );

      // Advance timer partially
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(3);

      // Rerender with same puzzle ID
      rerender({ puzzleId: 1 });

      // State should not reset
      expect(result.current.timeLeft).toBe(3);
    });

    it('should handle undefined puzzle ID', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ puzzleId: undefined })
      );

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
    });

    it('should handle null puzzle ID', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ puzzleId: null as any })
      );

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
    });
  });

  describe('Mapping Duration Changes', () => {
    it('should update timer when mapping duration changes', () => {
      const { result, rerender } = renderHook(
        ({ mappingDuration }) => useMemoryGameState({ mappingDuration }),
        { initialProps: { mappingDuration: 5 } }
      );

      expect(result.current.timeLeft).toBe(5);

      rerender({ mappingDuration: 10 });

      expect(result.current.timeLeft).toBe(10);
    });

    it('should reset timer when mapping duration changes', () => {
      const { result, rerender } = renderHook(
        ({ mappingDuration }) => useMemoryGameState({ mappingDuration }),
        { initialProps: { mappingDuration: 5 } }
      );

      // Advance timer partially
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(3);

      // Change mapping duration
      rerender({ mappingDuration: 10 });

      // Timer should reset to new duration
      expect(result.current.timeLeft).toBe(10);
    });
  });

  describe('Callback Functionality', () => {
    it('should call onMappingComplete when timer completes', () => {
      const onMappingComplete = vi.fn();
      const { result } = renderHook(() => 
        useMemoryGameState({ onMappingComplete })
      );

      // Advance timer to complete countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onMappingComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onMappingComplete when not provided', () => {
      const { result } = renderHook(() => useMemoryGameState());

      // Advance timer to complete countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should not throw error
      expect(result.current.isComplete).toBe(true);
    });

    it('should call onMappingComplete only once per completion', () => {
      const onMappingComplete = vi.fn();
      const { result } = renderHook(() => 
        useMemoryGameState({ onMappingComplete })
      );

      // Advance timer to complete countdown
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onMappingComplete).toHaveBeenCalledTimes(1);

      // Advance timer further
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should not call again
      expect(onMappingComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid puzzle ID changes', () => {
      const { result, rerender } = renderHook(
        ({ puzzleId }) => useMemoryGameState({ puzzleId }),
        { initialProps: { puzzleId: 1 } }
      );

      // Rapidly change puzzle IDs
      rerender({ puzzleId: 2 });
      rerender({ puzzleId: 3 });
      rerender({ puzzleId: 4 });

      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
    });

    it('should handle component unmounting during countdown', () => {
      const { result, unmount } = renderHook(() => useMemoryGameState());

      // Start countdown
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(3);

      // Unmount component
      unmount();

      // Should not throw error
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    });

    it('should handle very short mapping duration', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ mappingDuration: 1 })
      );

      expect(result.current.timeLeft).toBe(1);

      // Advance timer to complete countdown
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.showMapping).toBe(false);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isComplete).toBe(true);
    });

    it('should handle zero mapping duration', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ mappingDuration: 0 })
      );

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.showMapping).toBe(false);
      expect(result.current.isComplete).toBe(true);
    });

    it('should handle negative mapping duration', () => {
      const { result } = renderHook(() => 
        useMemoryGameState({ mappingDuration: -1 })
      );

      expect(result.current.timeLeft).toBe(-1);
      expect(result.current.showMapping).toBe(false);
      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state during countdown', () => {
      const { result } = renderHook(() => useMemoryGameState());

      // Check initial state
      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(5);
      expect(result.current.isComplete).toBe(false);

      // Advance timer partially
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Check intermediate state
      expect(result.current.showMapping).toBe(true);
      expect(result.current.timeLeft).toBe(3);
      expect(result.current.isComplete).toBe(false);

      // Complete countdown
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Check final state
      expect(result.current.showMapping).toBe(false);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isComplete).toBe(true);
    });

    it('should not have conflicting states', () => {
      const { result } = renderHook(() => useMemoryGameState());

      // Should not be complete while showing mapping
      expect(result.current.showMapping).toBe(true);
      expect(result.current.isComplete).toBe(false);

      // Complete the mapping phase
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should not show mapping when complete
      expect(result.current.showMapping).toBe(false);
      expect(result.current.isComplete).toBe(true);
    });
  });
}); 