export interface MultitaskingPuzzleData {
  rows: number;
  digitsPerRow: number;
  timeLimit: number;
  sixPositions: number[]; // Position of 6 in each row (0-indexed)
}

export interface MultitaskingPuzzleValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateMultitaskingPuzzleData = (data: any): MultitaskingPuzzleValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data structure');
    return { isValid: false, errors };
  }

  // Check required fields
  if (typeof data.rows !== 'number' || data.rows < 1) {
    errors.push('Invalid rows count');
  }

  if (typeof data.digitsPerRow !== 'number' || data.digitsPerRow < 1) {
    errors.push('Invalid digits per row');
  }

  if (typeof data.timeLimit !== 'number' || data.timeLimit < 1) {
    errors.push('Invalid time limit');
  }

  // Check sixPositions array
  if (!Array.isArray(data.sixPositions)) {
    errors.push('Missing sixPositions array');
  } else {
    if (data.sixPositions.length !== data.rows) {
      errors.push('SixPositions length must match rows count');
    } else {
      for (let i = 0; i < data.sixPositions.length; i++) {
        const pos = data.sixPositions[i];
        if (typeof pos !== 'number' || pos < 0 || pos >= data.digitsPerRow) {
          errors.push(`Invalid six position at row ${i}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const extractMultitaskingPuzzleData = (data: any): MultitaskingPuzzleData | null => {
  // If backend sends empty data, generate puzzle data on frontend
  if (!data || Object.keys(data).length === 0) {
    // Fixed values according to game rules: 3-4 rows, 9 digits per row, 10 seconds
    const rows = 3; // Fixed at 3 rows
    const digitsPerRow = 9; // Fixed at 9 digits per row
    const timeLimit = 10; // Fixed at 10 seconds

    // Generate random positions for exactly one 6 per row
    const sixPositions: number[] = [];
    for (let i = 0; i < rows; i++) {
      sixPositions.push(Math.floor(Math.random() * digitsPerRow));
    }

    return {
      rows,
      digitsPerRow,
      timeLimit,
      sixPositions
    };
  }

  // Validate existing data if provided
  const validation = validateMultitaskingPuzzleData(data);

  if (!validation.isValid) {
    console.error('Invalid multitasking puzzle data:', validation.errors);
    return null;
  }

  return {
    rows: data.rows,
    digitsPerRow: data.digitsPerRow,
    timeLimit: data.timeLimit,
    sixPositions: [...data.sixPositions]
  };
};

export const generateNumberGrid = (puzzleData: MultitaskingPuzzleData): string[][] => {
  const grid: string[][] = [];

  for (let row = 0; row < puzzleData.rows; row++) {
    const rowDigits: string[] = [];
    const sixPosition = puzzleData.sixPositions[row];

    for (let col = 0; col < puzzleData.digitsPerRow; col++) {
      rowDigits.push(col === sixPosition ? '6' : '9');
    }

    grid.push(rowDigits);
  }

  return grid;
};

export const checkWinCondition = (foundPositions: number[], puzzleData: MultitaskingPuzzleData): boolean => {
  if (foundPositions.length !== puzzleData.rows) {
    return false;
  }

  // Check if all found positions match the expected six positions
  for (let i = 0; i < puzzleData.rows; i++) {
    if (foundPositions[i] !== puzzleData.sixPositions[i]) {
      return false;
    }
  }

  return true;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
