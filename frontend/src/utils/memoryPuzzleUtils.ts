export interface MemoryPuzzleData {
  mapping: Record<string, string>;
  question_number: string;
  choices: string[];
}

export interface MemoryPuzzleValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates memory puzzle data structure
 */
export const validateMemoryPuzzleData = (data: any): MemoryPuzzleValidation => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Puzzle data is missing');
    return { isValid: false, errors };
  }

  if (!data.mapping || typeof data.mapping !== 'object') {
    errors.push('Mapping is missing or invalid');
  }

  if (!data.question_number || typeof data.question_number !== 'string') {
    errors.push('Question number is missing or invalid');
  }

  if (!Array.isArray(data.choices) || data.choices.length === 0) {
    errors.push('Choices array is missing or empty');
  }

  // Validate mapping structure
  if (data.mapping && typeof data.mapping === 'object') {
    const mappingEntries = Object.entries(data.mapping);
    
    if (mappingEntries.length === 0) {
      errors.push('Mapping is empty');
    }

    // Check if all values are strings
    for (const [key, value] of mappingEntries) {
      if (typeof value !== 'string') {
        errors.push(`Invalid mapping value for key ${key}`);
      }
    }

    // Validate that question number exists in mapping
    if (data.question_number && !(data.question_number in data.mapping)) {
      errors.push('Question number not found in mapping');
    }

    // Validate that correct answer is in choices
    if (data.question_number && data.choices) {
      const correctAnswer = data.mapping[data.question_number];
      if (!data.choices.includes(correctAnswer)) {
        errors.push('Correct answer not found in choices');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Extracts and validates memory puzzle data
 */
export const extractMemoryPuzzleData = (puzzle: any): MemoryPuzzleData | null => {
  const validation = validateMemoryPuzzleData(puzzle?.data);
  
  if (!validation.isValid) {
    console.error('Invalid memory puzzle data:', validation.errors);
    return null;
  }

  return puzzle.data as MemoryPuzzleData;
};

/**
 * Checks if the provided answer is correct
 */
export const isCorrectAnswer = (
  data: MemoryPuzzleData,
  answer: string
): boolean => {
  const correctAnswer = data.mapping[data.question_number];
  return answer === correctAnswer;
};

/**
 * Formats mapping for display
 */
export const formatMappingForDisplay = (mapping: Record<string, string>): Array<{ number: string; color: string }> => {
  // Sort by number to preserve consistent order
  return Object.entries(mapping)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([number, color]) => ({
      number,
      color,
    }));
};

/**
 * Generates accessible labels for mapping items
 */
export const generateMappingLabel = (number: string, color: string): string => {
  return `Number ${number} is ${color}`;
};

/**
 * Generates accessible labels for choice options
 */
export const generateChoiceLabel = (choice: string): string => {
  return choice;
}; 