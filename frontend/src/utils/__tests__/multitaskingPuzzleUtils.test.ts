import { describe, it, expect } from 'vitest';
import {
  validateMultitaskingPuzzleData,
  extractMultitaskingPuzzleData,
  generateNumberGrid,
  checkWinCondition,
  formatTime
} from '../multitaskingPuzzleUtils';
import type { MultitaskingPuzzleData } from '../multitaskingPuzzleUtils';

describe('multitaskingPuzzleUtils', () => {
  describe('validateMultitaskingPuzzleData', () => {
    it('should validate correct puzzle data', () => {
      const validData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const result = validateMultitaskingPuzzleData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid data structure', () => {
      const invalidData = null;
      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid data structure');
    });

    it('should reject invalid rows count', () => {
      const invalidData = {
        rows: 0,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid rows count');
    });

    it('should reject invalid digits per row', () => {
      const invalidData = {
        rows: 3,
        digitsPerRow: -1,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid digits per row');
    });

    it('should reject invalid time limit', () => {
      const invalidData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 0,
        sixPositions: [2, 5, 7]
      };

      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid time limit');
    });

    it('should reject missing sixPositions array', () => {
      const invalidData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10
      };

      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing sixPositions array');
    });

    it('should reject sixPositions length mismatch', () => {
      const invalidData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5] // Only 2 positions for 3 rows
      };

      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SixPositions length must match rows count');
    });

    it('should reject invalid six positions', () => {
      const invalidData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 15, 7] // 15 is out of range for 9 digits
      };

      const result = validateMultitaskingPuzzleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid six position at row 1');
    });
  });

  describe('extractMultitaskingPuzzleData', () => {
    it('should extract valid puzzle data', () => {
      const validData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const result = extractMultitaskingPuzzleData(validData);
      expect(result).toEqual({
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      });
    });

    it('should return null for invalid data', () => {
      const invalidData = {
        rows: -1,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const result = extractMultitaskingPuzzleData(invalidData);
      expect(result).toBeNull();
    });

    it('should create a copy of sixPositions array', () => {
      const originalData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const result = extractMultitaskingPuzzleData(originalData);
      expect(result?.sixPositions).not.toBe(originalData.sixPositions);
      expect(result?.sixPositions).toEqual(originalData.sixPositions);
    });
  });

  describe('generateNumberGrid', () => {
    it('should generate correct grid with 6s in specified positions', () => {
      const puzzleData: MultitaskingPuzzleData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const grid = generateNumberGrid(puzzleData);
      
      expect(grid).toHaveLength(3);
      expect(grid[0]).toHaveLength(9);
      expect(grid[1]).toHaveLength(9);
      expect(grid[2]).toHaveLength(9);

      // Check that 6s are in the correct positions
      expect(grid[0][2]).toBe('6');
      expect(grid[1][5]).toBe('6');
      expect(grid[2][7]).toBe('6');

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

    it('should handle edge cases', () => {
      const puzzleData: MultitaskingPuzzleData = {
        rows: 1,
        digitsPerRow: 1,
        timeLimit: 10,
        sixPositions: [0]
      };

      const grid = generateNumberGrid(puzzleData);
      expect(grid).toEqual([['6']]);
    });
  });

  describe('checkWinCondition', () => {
    it('should return true for correct win condition', () => {
      const puzzleData: MultitaskingPuzzleData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const foundPositions = [2, 5, 7];
      const result = checkWinCondition(foundPositions, puzzleData);
      expect(result).toBe(true);
    });

    it('should return false for incorrect positions', () => {
      const puzzleData: MultitaskingPuzzleData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const foundPositions = [2, 5, 6]; // Wrong last position
      const result = checkWinCondition(foundPositions, puzzleData);
      expect(result).toBe(false);
    });

    it('should return false for incomplete positions', () => {
      const puzzleData: MultitaskingPuzzleData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const foundPositions = [2, 5]; // Missing last position
      const result = checkWinCondition(foundPositions, puzzleData);
      expect(result).toBe(false);
    });

    it('should return false for too many positions', () => {
      const puzzleData: MultitaskingPuzzleData = {
        rows: 3,
        digitsPerRow: 9,
        timeLimit: 10,
        sixPositions: [2, 5, 7]
      };

      const foundPositions = [2, 5, 7, 8]; // Extra position
      const result = checkWinCondition(foundPositions, puzzleData);
      expect(result).toBe(false);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(600)).toBe('10:00');
    });

    it('should handle edge cases', () => {
      expect(formatTime(1)).toBe('0:01');
      expect(formatTime(59)).toBe('0:59');
      expect(formatTime(3600)).toBe('60:00');
    });
  });
}); 