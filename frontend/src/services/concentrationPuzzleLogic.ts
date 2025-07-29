export interface ColorPair {
  color_word: string;
  circle_color: string;
  is_match: boolean;
}

export interface ConcentrationPuzzleData {
  pairs: ColorPair[];
  duration: number; // seconds per pair
}

export interface ConcentrationGameState {
  currentIndex: number;
  hasClicked: boolean;
  isComplete: boolean;
  gameResult: 'success' | 'failure' | null;
  clickedIndex: number | null;
}

export interface ConcentrationGameConfig {
  totalPairs: number;
  durationPerPair: number; // seconds
  autoAdvance: boolean;
}

/**
 * Get CSS color value from color name
 */
export function getColorValue(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    red: '#ff4444',
    blue: '#4444ff',
    yellow: '#ffff44',
    green: '#44ff44',
    purple: '#ff44ff',
    orange: '#ff8844',
    pink: '#ff88cc',
    cyan: '#44ffff',
    brown: '#884400',
    gray: '#888888',
    black: '#000000',
    white: '#ffffff'
  };
  return colorMap[colorName.toLowerCase()] || '#888888';
}

/**
 * Validate concentration puzzle data
 */
export function validateConcentrationPuzzleData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { isValid: false, errors };
  }

  if (!Array.isArray(data.pairs)) {
    errors.push('Pairs must be an array');
    return { isValid: false, errors };
  }

  if (data.pairs.length === 0) {
    errors.push('Pairs array cannot be empty');
    return { isValid: false, errors };
  }

  if (typeof data.duration !== 'number' || data.duration <= 0) {
    errors.push('Duration must be a positive number');
    return { isValid: false, errors };
  }

  // Validate each pair
  data.pairs.forEach((pair: any, index: number) => {
    if (!pair || typeof pair !== 'object') {
      errors.push(`Pair ${index} must be an object`);
      return;
    }

    if (typeof pair.color_word !== 'string' || !pair.color_word) {
      errors.push(`Pair ${index} must have a valid color_word string`);
    }

    if (typeof pair.circle_color !== 'string' || !pair.circle_color) {
      errors.push(`Pair ${index} must have a valid circle_color string`);
    }

    if (typeof pair.is_match !== 'boolean') {
      errors.push(`Pair ${index} must have a valid is_match boolean`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Get initial game state
 */
export function getInitialConcentrationGameState(): ConcentrationGameState {
  return {
    currentIndex: 0,
    hasClicked: false,
    isComplete: false,
    gameResult: null,
    clickedIndex: null
  };
}

/**
 * Process a click event
 */
export function processClick(
  currentState: ConcentrationGameState,
  pairs: ColorPair[]
): { newState: ConcentrationGameState; result: 'success' | 'failure' } {
  if (currentState.hasClicked || currentState.isComplete) {
    return { newState: currentState, result: 'failure' };
  }

  const currentPair = pairs[currentState.currentIndex];
  const isCorrect = currentPair.is_match;

  const newState: ConcentrationGameState = {
    ...currentState,
    hasClicked: true,
    isComplete: true,
    gameResult: isCorrect ? 'success' : 'failure',
    clickedIndex: currentState.currentIndex
  };

  return { newState, result: isCorrect ? 'success' : 'failure' };
}

/**
 * Advance to next pair
 */
export function advanceToNextPair(
  currentState: ConcentrationGameState,
  totalPairs: number
): ConcentrationGameState {
  if (currentState.hasClicked || currentState.isComplete) {
    return currentState;
  }

  const nextIndex = currentState.currentIndex + 1;

  if (nextIndex >= totalPairs) {
    // Timeout - no click was made
    return {
      ...currentState,
      isComplete: true,
      gameResult: 'failure',
      clickedIndex: null
    };
  }

  return {
    ...currentState,
    currentIndex: nextIndex
  };
}

/**
 * Check if game should auto-advance
 */
export function shouldAutoAdvance(
  currentState: ConcentrationGameState,
  totalPairs: number
): boolean {
  return !currentState.hasClicked &&
         !currentState.isComplete &&
         currentState.currentIndex < totalPairs;
}

/**
 * Get game progress percentage
 */
export function getGameProgress(currentState: ConcentrationGameState, totalPairs: number): number {
  if (currentState.isComplete) {
    return 100;
  }
  return Math.round((currentState.currentIndex / totalPairs) * 100);
}

/**
 * Get current pair data
 */
export function getCurrentPair(
  currentState: ConcentrationGameState,
  pairs: ColorPair[]
): ColorPair | null {
  if (currentState.isComplete || currentState.currentIndex >= pairs.length) {
    return null;
  }
  return pairs[currentState.currentIndex];
}

/**
 * Check if game is active (not complete)
 */
export function isGameActive(currentState: ConcentrationGameState): boolean {
  return !currentState.isComplete;
}
