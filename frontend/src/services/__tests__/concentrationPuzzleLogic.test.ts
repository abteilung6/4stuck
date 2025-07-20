import { describe, it, expect } from 'vitest';
import {
  getColorValue,
  validateConcentrationPuzzleData,
  getInitialConcentrationGameState,
  processClick,
  advanceToNextPair,
  shouldAutoAdvance,
  getGameProgress,
  getCurrentPair,
  isGameActive,
  type ColorPair,
  type ConcentrationGameState
} from '../concentrationPuzzleLogic';

describe('concentrationPuzzleLogic', () => {
  describe('getColorValue', () => {
    it('should return correct color values for known colors', () => {
      expect(getColorValue('red')).toBe('#ff4444');
      expect(getColorValue('blue')).toBe('#4444ff');
      expect(getColorValue('yellow')).toBe('#ffff44');
      expect(getColorValue('green')).toBe('#44ff44');
      expect(getColorValue('purple')).toBe('#ff44ff');
      expect(getColorValue('orange')).toBe('#ff8844');
    });

    it('should handle case insensitive color names', () => {
      expect(getColorValue('RED')).toBe('#ff4444');
      expect(getColorValue('Blue')).toBe('#4444ff');
      expect(getColorValue('YELLOW')).toBe('#ffff44');
    });

    it('should return fallback color for unknown colors', () => {
      expect(getColorValue('unknown')).toBe('#888888');
      expect(getColorValue('')).toBe('#888888');
    });
  });

  describe('validateConcentrationPuzzleData', () => {
    it('should validate correct puzzle data', () => {
      const validData = {
        pairs: [
          { color_word: 'red', circle_color: 'blue', is_match: false },
          { color_word: 'blue', circle_color: 'blue', is_match: true }
        ],
        duration: 2
      };

      const result = validateConcentrationPuzzleData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid data types', () => {
      const result = validateConcentrationPuzzleData(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
    });

    it('should reject missing pairs array', () => {
      const result = validateConcentrationPuzzleData({ duration: 2 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pairs must be an array');
    });

    it('should reject empty pairs array', () => {
      const result = validateConcentrationPuzzleData({ pairs: [], duration: 2 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pairs array cannot be empty');
    });

    it('should reject invalid duration', () => {
      const result = validateConcentrationPuzzleData({
        pairs: [{ color_word: 'red', circle_color: 'blue', is_match: false }],
        duration: -1
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duration must be a positive number');
    });

    it('should validate individual pairs', () => {
      const result = validateConcentrationPuzzleData({
        pairs: [
          { color_word: '', circle_color: 'blue', is_match: false },
          { color_word: 'red', circle_color: '', is_match: false },
          { color_word: 'red', circle_color: 'blue', is_match: 'invalid' }
        ],
        duration: 2
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pair 0 must have a valid color_word string');
      expect(result.errors).toContain('Pair 1 must have a valid circle_color string');
      expect(result.errors).toContain('Pair 2 must have a valid is_match boolean');
    });
  });

  describe('getInitialConcentrationGameState', () => {
    it('should return initial game state', () => {
      const state = getInitialConcentrationGameState();
      expect(state).toEqual({
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      });
    });
  });

  describe('processClick', () => {
    const pairs: ColorPair[] = [
      { color_word: 'red', circle_color: 'blue', is_match: false },
      { color_word: 'blue', circle_color: 'blue', is_match: true }
    ];

    it('should process correct click', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 1, // Index of matching pair
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const { newState, result } = processClick(initialState, pairs);
      expect(result).toBe('success');
      expect(newState.hasClicked).toBe(true);
      expect(newState.isComplete).toBe(true);
      expect(newState.gameResult).toBe('success');
      expect(newState.clickedIndex).toBe(1);
    });

    it('should process incorrect click', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 0, // Index of non-matching pair
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const { newState, result } = processClick(initialState, pairs);
      expect(result).toBe('failure');
      expect(newState.hasClicked).toBe(true);
      expect(newState.isComplete).toBe(true);
      expect(newState.gameResult).toBe('failure');
      expect(newState.clickedIndex).toBe(0);
    });

    it('should not process click if already clicked', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: true,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const { newState, result } = processClick(initialState, pairs);
      expect(result).toBe('failure');
      expect(newState).toEqual(initialState);
    });

    it('should not process click if game is complete', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: null
      };

      const { newState, result } = processClick(initialState, pairs);
      expect(result).toBe('failure');
      expect(newState).toEqual(initialState);
    });
  });

  describe('advanceToNextPair', () => {
    it('should advance to next pair', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const newState = advanceToNextPair(initialState, 3);
      expect(newState.currentIndex).toBe(1);
      expect(newState.isComplete).toBe(false);
    });

    it('should complete game when reaching end', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 2, // Last pair
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const newState = advanceToNextPair(initialState, 3);
      expect(newState.isComplete).toBe(true);
      expect(newState.gameResult).toBe('failure');
      expect(newState.clickedIndex).toBe(null);
    });

    it('should not advance if already clicked', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: true,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const newState = advanceToNextPair(initialState, 3);
      expect(newState).toEqual(initialState);
    });

    it('should not advance if game is complete', () => {
      const initialState: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: true,
        gameResult: 'success',
        clickedIndex: 0
      };

      const newState = advanceToNextPair(initialState, 3);
      expect(newState).toEqual(initialState);
    });
  });

  describe('shouldAutoAdvance', () => {
    it('should return true for active game', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      expect(shouldAutoAdvance(state, 3)).toBe(true);
    });

    it('should return false if clicked', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: true,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      expect(shouldAutoAdvance(state, 3)).toBe(false);
    });

    it('should return false if complete', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: null
      };

      expect(shouldAutoAdvance(state, 3)).toBe(false);
    });

    it('should return false if at end', () => {
      const state: ConcentrationGameState = {
        currentIndex: 3,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      expect(shouldAutoAdvance(state, 3)).toBe(false);
    });
  });

  describe('getGameProgress', () => {
    it('should return 0 for initial state', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      expect(getGameProgress(state, 3)).toBe(0);
    });

    it('should return progress percentage', () => {
      const state: ConcentrationGameState = {
        currentIndex: 1,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      expect(getGameProgress(state, 3)).toBe(33);
    });

    it('should return 100 for complete game', () => {
      const state: ConcentrationGameState = {
        currentIndex: 2,
        hasClicked: false,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: null
      };

      expect(getGameProgress(state, 3)).toBe(100);
    });
  });

  describe('getCurrentPair', () => {
    const pairs: ColorPair[] = [
      { color_word: 'red', circle_color: 'blue', is_match: false },
      { color_word: 'blue', circle_color: 'blue', is_match: true }
    ];

    it('should return current pair', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const pair = getCurrentPair(state, pairs);
      expect(pair).toEqual(pairs[0]);
    });

    it('should return null if index out of bounds', () => {
      const state: ConcentrationGameState = {
        currentIndex: 5,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      const pair = getCurrentPair(state, pairs);
      expect(pair).toBeNull();
    });

    it('should return null if game is complete', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: true,
        isComplete: true,
        gameResult: 'success',
        clickedIndex: 0
      };

      const pair = getCurrentPair(state, pairs);
      expect(pair).toBeNull();
    });
  });

  describe('isGameActive', () => {
    it('should return true for active game', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      };

      expect(isGameActive(state)).toBe(true);
    });

    it('should return false for complete game', () => {
      const state: ConcentrationGameState = {
        currentIndex: 0,
        hasClicked: false,
        isComplete: true,
        gameResult: 'success',
        clickedIndex: 0
      };

      expect(isGameActive(state)).toBe(false);
    });
  });
}); 