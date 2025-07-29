import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateMemoryPuzzleData,
  extractMemoryPuzzleData,
  isCorrectAnswer,
  formatMappingForDisplay,
  generateMappingLabel,
  generateChoiceLabel,
  type MemoryPuzzleData,
  type MemoryPuzzleValidation,
} from '../memoryPuzzleUtils';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('memoryPuzzleUtils', () => {
  const validPuzzleData: MemoryPuzzleData = {
    mapping: { '1': 'red', '2': 'blue', '3': 'green' },
    question_number: '2',
    choices: ['red', 'blue', 'green', 'yellow'],
  };

  describe('validateMemoryPuzzleData', () => {
    it('should validate correct puzzle data', () => {
      const result = validateMemoryPuzzleData(validPuzzleData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null data', () => {
      const result = validateMemoryPuzzleData(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Puzzle data is missing');
    });

    it('should reject undefined data', () => {
      const result = validateMemoryPuzzleData(undefined);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Puzzle data is missing');
    });

    it('should reject missing mapping', () => {
      const invalidData = { ...validPuzzleData, mapping: undefined };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mapping is missing or invalid');
    });

    it('should reject non-object mapping', () => {
      const invalidData = { ...validPuzzleData, mapping: 'not-an-object' };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mapping is missing or invalid');
    });

    it('should reject empty mapping', () => {
      const invalidData = { ...validPuzzleData, mapping: {} };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mapping is empty');
    });

    it('should reject missing question_number', () => {
      const invalidData = { ...validPuzzleData, question_number: undefined };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question number is missing or invalid');
    });

    it('should reject non-string question_number', () => {
      const invalidData = { ...validPuzzleData, question_number: 123 };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question number is missing or invalid');
    });

    it('should reject missing choices', () => {
      const invalidData = { ...validPuzzleData, choices: undefined };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Choices array is missing or empty');
    });

    it('should reject non-array choices', () => {
      const invalidData = { ...validPuzzleData, choices: 'not-an-array' };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Choices array is missing or empty');
    });

    it('should reject empty choices array', () => {
      const invalidData = { ...validPuzzleData, choices: [] };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Choices array is missing or empty');
    });

    it('should reject mapping with non-string values', () => {
      const invalidData = {
        ...validPuzzleData,
        mapping: { '1': 'red', '2': 123, '3': 'green' },
      };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid mapping value for key 2');
    });

    it('should reject when question number not in mapping', () => {
      const invalidData = {
        ...validPuzzleData,
        question_number: '5',
      };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question number not found in mapping');
    });

    it('should reject when correct answer not in choices', () => {
      const invalidData = {
        ...validPuzzleData,
        choices: ['red', 'green', 'yellow', 'purple'],
      };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer not found in choices');
    });

    it('should collect multiple errors', () => {
      const invalidData = {
        mapping: {},
        question_number: undefined,
        choices: [],
      };
      const result = validateMemoryPuzzleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mapping is empty');
      expect(result.errors).toContain('Question number is missing or invalid');
      expect(result.errors).toContain('Choices array is missing or empty');
    });
  });

  describe('extractMemoryPuzzleData', () => {
    it('should extract valid puzzle data', () => {
      const puzzle = { data: validPuzzleData };
      const result = extractMemoryPuzzleData(puzzle);

      expect(result).toEqual(validPuzzleData);
    });

    it('should return null for invalid puzzle data', () => {
      const puzzle = { data: { mapping: {}, question_number: undefined, choices: [] } };
      const result = extractMemoryPuzzleData(puzzle);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid memory puzzle data:', expect.any(Array));
    });

    it('should return null for puzzle without data', () => {
      const puzzle = {};
      const result = extractMemoryPuzzleData(puzzle);

      expect(result).toBeNull();
    });

    it('should return null for null puzzle', () => {
      const result = extractMemoryPuzzleData(null);

      expect(result).toBeNull();
    });
  });

  describe('isCorrectAnswer', () => {
    it('should return true for correct answer', () => {
      const result = isCorrectAnswer(validPuzzleData, 'blue');

      expect(result).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const result = isCorrectAnswer(validPuzzleData, 'red');

      expect(result).toBe(false);
    });

    it('should return false for answer not in choices', () => {
      const result = isCorrectAnswer(validPuzzleData, 'purple');

      expect(result).toBe(false);
    });

    it('should handle case-sensitive comparison', () => {
      const result = isCorrectAnswer(validPuzzleData, 'Blue');

      expect(result).toBe(false);
    });

    it('should handle empty answer', () => {
      const result = isCorrectAnswer(validPuzzleData, '');

      expect(result).toBe(false);
    });
  });

  describe('formatMappingForDisplay', () => {
    it('should format mapping correctly', () => {
      const mapping = { '1': 'red', '2': 'blue', '3': 'green' };
      const result = formatMappingForDisplay(mapping);

      expect(result).toEqual([
        { number: '1', color: 'red' },
        { number: '2', color: 'blue' },
        { number: '3', color: 'green' },
      ]);
    });

    it('should handle empty mapping', () => {
      const mapping = {};
      const result = formatMappingForDisplay(mapping);

      expect(result).toEqual([]);
    });

    it('should handle single item mapping', () => {
      const mapping = { '1': 'red' };
      const result = formatMappingForDisplay(mapping);

      expect(result).toEqual([
        { number: '1', color: 'red' },
      ]);
    });

    it('should preserve order of entries', () => {
      const mapping = { '3': 'green', '1': 'red', '2': 'blue' };
      const result = formatMappingForDisplay(mapping);

      expect(result).toEqual([
        { number: '1', color: 'red' },
        { number: '2', color: 'blue' },
        { number: '3', color: 'green' },
      ]);
    });
  });

  describe('generateMappingLabel', () => {
    it('should generate correct label', () => {
      const result = generateMappingLabel('2', 'blue');

      expect(result).toBe('Number 2 is blue');
    });

    it('should handle different number and color combinations', () => {
      expect(generateMappingLabel('1', 'red')).toBe('Number 1 is red');
      expect(generateMappingLabel('10', 'purple')).toBe('Number 10 is purple');
      expect(generateMappingLabel('A', 'yellow')).toBe('Number A is yellow');
    });

    it('should handle empty strings', () => {
      expect(generateMappingLabel('', 'blue')).toBe('Number  is blue');
      expect(generateMappingLabel('2', '')).toBe('Number 2 is ');
    });
  });

  describe('generateChoiceLabel', () => {
    it('should return choice as-is', () => {
      const result = generateChoiceLabel('blue');

      expect(result).toBe('blue');
    });

    it('should handle different choice values', () => {
      expect(generateChoiceLabel('red')).toBe('red');
      expect(generateChoiceLabel('green')).toBe('green');
      expect(generateChoiceLabel('yellow')).toBe('yellow');
    });

    it('should handle empty string', () => {
      expect(generateChoiceLabel('')).toBe('');
    });

    it('should handle special characters', () => {
      expect(generateChoiceLabel('blue-green')).toBe('blue-green');
      expect(generateChoiceLabel('light blue')).toBe('light blue');
    });
  });
});
