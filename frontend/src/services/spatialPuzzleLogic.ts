export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  circlePosition: Position;
  obstaclePosition: Position;
  obstacleDirection: 'left' | 'right';
  gameWon: boolean;
  gameLost: boolean;
}

export interface GameConfig {
  gameWidth: number;
  gameHeight: number;
  circleRadius: number;
  obstacleWidth: number;
  obstacleHeight: number;
  obstacleSpeed: number;
}

export interface GameResult {
  type: 'won' | 'lost' | null;
  reason?: string;
}

/**
 * Validate game configuration
 */
export function validateGameConfig(config: GameConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.gameWidth <= 0) errors.push('Game width must be positive');
  if (config.gameHeight <= 0) errors.push('Game height must be positive');
  if (config.circleRadius <= 0) errors.push('Circle radius must be positive');
  if (config.obstacleWidth <= 0) errors.push('Obstacle width must be positive');
  if (config.obstacleHeight <= 0) errors.push('Obstacle height must be positive');
  if (config.obstacleSpeed <= 0) errors.push('Obstacle speed must be positive');

  if (config.circleRadius * 2 > config.gameWidth) {
    errors.push('Circle diameter cannot exceed game width');
  }

  if (config.circleRadius * 2 > config.gameHeight) {
    errors.push('Circle diameter cannot exceed game height');
  }

  if (config.obstacleWidth > config.gameWidth) {
    errors.push('Obstacle width cannot exceed game width');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check collision between circle and obstacle
 */
export function checkCollision(
  circlePos: Position,
  obstaclePos: Position,
  circleRadius: number,
  obstacleWidth: number,
  obstacleHeight: number
): boolean {
  const circleLeft = circlePos.x;
  const circleRight = circlePos.x + circleRadius * 2;
  const circleTop = circlePos.y;
  const circleBottom = circlePos.y + circleRadius * 2;

  const obstacleLeft = obstaclePos.x;
  const obstacleRight = obstaclePos.x + obstacleWidth;
  const obstacleTop = obstaclePos.y;
  const obstacleBottom = obstaclePos.y + obstacleHeight;

  // Check if rectangles overlap
  return !(circleLeft >= obstacleRight ||
           circleRight <= obstacleLeft ||
           circleTop >= obstacleBottom ||
           circleBottom <= obstacleTop);
}

/**
 * Check if circle reached the bottom (win condition)
 */
export function checkWinCondition(
  circlePos: Position,
  gameHeight: number,
  circleRadius: number
): boolean {
  // The bottom of the circle
  const circleBottom = circlePos.y + circleRadius * 2;
  // Require the bottom of the circle to be within 10px of the game bottom
  return circleBottom >= gameHeight - 10;
}

/**
 * Update obstacle position based on current direction and speed
 */
export function updateObstaclePosition(
  currentPos: Position,
  direction: 'left' | 'right',
  speed: number,
  gameWidth: number,
  obstacleWidth: number
): { newPosition: Position; newDirection: 'left' | 'right' } {
  let newX = currentPos.x;
  let newDirection = direction;

  if (direction === 'right') {
    newX += speed;
    if (newX >= gameWidth - obstacleWidth) {
      newDirection = 'left';
    }
  } else {
    newX -= speed;
    if (newX <= 0) {
      newDirection = 'right';
    }
  }

  return {
    newPosition: { ...currentPos, x: newX },
    newDirection
  };
}

/**
 * Calculate new circle position based on mouse coordinates and drag offset
 */
export function calculateCirclePosition(
  mouseX: number,
  mouseY: number,
  dragOffset: Position,
  gameWidth: number,
  gameHeight: number,
  circleRadius: number
): Position {
  const newX = Math.max(0, Math.min(gameWidth - circleRadius * 2, mouseX - dragOffset.x));
  const newY = Math.max(0, Math.min(gameHeight - circleRadius * 2, mouseY - dragOffset.y));

  return { x: newX, y: newY };
}

/**
 * Check if mouse is within circle bounds for drag detection
 */
export function isMouseInCircle(
  mouseX: number,
  mouseY: number,
  circlePos: Position,
  circleRadius: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(mouseX - circlePos.x - circleRadius, 2) +
    Math.pow(mouseY - circlePos.y - circleRadius, 2)
  );

  return distance <= circleRadius;
}

/**
 * Calculate drag offset when starting to drag
 */
export function calculateDragOffset(
  mouseX: number,
  mouseY: number,
  circlePos: Position
): Position {
  return {
    x: mouseX - circlePos.x,
    y: mouseY - circlePos.y,
  };
}

/**
 * Get initial game state
 */
export function getInitialGameState(config: GameConfig): GameState {
  return {
    circlePosition: {
      x: config.gameWidth / 2 - config.circleRadius,
      y: 0 // Start at the very top
    },
    obstaclePosition: {
      x: 0,
      y: config.gameHeight / 2 - config.obstacleHeight / 2
    },
    obstacleDirection: 'right',
    gameWon: false,
    gameLost: false
  };
}

/**
 * Process one game tick - update obstacle and check game conditions
 */
export function processGameTick(
  currentState: GameState,
  config: GameConfig
): {
  newState: GameState;
  shouldEndGame: boolean;
  gameResult: GameResult
} {
  // Don't process if game is already over
  if (currentState.gameWon || currentState.gameLost) {
    return {
      newState: currentState,
      shouldEndGame: false,
      gameResult: { type: null }
    };
  }

  // Update obstacle position
  const { newPosition: newObstaclePos, newDirection } = updateObstaclePosition(
    currentState.obstaclePosition,
    currentState.obstacleDirection,
    config.obstacleSpeed,
    config.gameWidth,
    config.obstacleWidth
  );

  // Check collision
  if (checkCollision(
    currentState.circlePosition,
    newObstaclePos,
    config.circleRadius,
    config.obstacleWidth,
    config.obstacleHeight
  )) {
    return {
      newState: {
        ...currentState,
        obstaclePosition: newObstaclePos,
        obstacleDirection: newDirection,
        gameLost: true
      },
      shouldEndGame: true,
      gameResult: { type: 'lost', reason: 'collision' }
    };
  }

  // Check win condition
  if (checkWinCondition(
    currentState.circlePosition,
    config.gameHeight,
    config.circleRadius
  )) {
    return {
      newState: {
        ...currentState,
        obstaclePosition: newObstaclePos,
        obstacleDirection: newDirection,
        gameWon: true
      },
      shouldEndGame: true,
      gameResult: { type: 'won', reason: 'reached_bottom' }
    };
  }

  // Continue game
  return {
    newState: {
      ...currentState,
      obstaclePosition: newObstaclePos,
      obstacleDirection: newDirection
    },
    shouldEndGame: false,
    gameResult: { type: null }
  };
}

/**
 * Get default game configuration
 */
export function getDefaultGameConfig(): GameConfig {
  return {
    gameWidth: 400,
    gameHeight: 600,
    circleRadius: 20,
    obstacleWidth: 80,
    obstacleHeight: 30,
    obstacleSpeed: 10.0
  };
}

/**
 * Calculate game statistics
 */
export function calculateGameStats(
  gameState: GameState,
  config: GameConfig
): {
  progress: number; // 0-100
  distanceToGoal: number;
  isInDangerZone: boolean;
} {
  const maxProgress = config.gameHeight - config.circleRadius * 2 - 20;
  const currentProgress = Math.max(0, Math.min(maxProgress, gameState.circlePosition.y - 20)); // Adjust for start position
  const progress = maxProgress > 0 ? (currentProgress / maxProgress) * 100 : 0;

  const distanceToGoal = maxProgress - currentProgress;

  // Check if circle is near obstacle (danger zone)
  const dangerZoneMargin = config.circleRadius * 2;
  const isInDangerZone = checkCollision(
    gameState.circlePosition,
    gameState.obstaclePosition,
    config.circleRadius + dangerZoneMargin,
    config.obstacleWidth + dangerZoneMargin,
    config.obstacleHeight + dangerZoneMargin
  );

  return {
    progress,
    distanceToGoal,
    isInDangerZone
  };
}
