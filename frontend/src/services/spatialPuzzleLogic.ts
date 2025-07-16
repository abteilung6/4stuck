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

  return !(circleLeft > obstacleRight || 
           circleRight < obstacleLeft || 
           circleTop > obstacleBottom || 
           circleBottom < obstacleTop);
}

/**
 * Check if circle reached the bottom (win condition)
 */
export function checkWinCondition(
  circlePos: Position, 
  gameHeight: number, 
  circleRadius: number
): boolean {
  return circlePos.y >= gameHeight - circleRadius * 2 - 20; // 20px margin from bottom
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
      y: 20 
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
  gameResult: 'won' | 'lost' | null 
} {
  // Don't process if game is already over
  if (currentState.gameWon || currentState.gameLost) {
    return {
      newState: currentState,
      shouldEndGame: false,
      gameResult: null
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
      gameResult: 'lost'
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
      gameResult: 'won'
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
    gameResult: null
  };
} 