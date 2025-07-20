import { describe, it, expect } from 'vitest';
import {
  checkCollision,
  checkWinCondition,
  updateObstaclePosition,
  calculateCirclePosition,
  isMouseInCircle,
  calculateDragOffset,
  getInitialGameState,
  processGameTick,
  type Position,
  type GameConfig,
  type GameState
} from './spatialPuzzleLogic';

describe('spatialPuzzleLogic', () => {
  const testConfig: GameConfig = {
    gameWidth: 400,
    gameHeight: 300,
    circleRadius: 15,
    obstacleWidth: 60,
    obstacleHeight: 20,
    obstacleSpeed: 2
  };

  describe('checkCollision', () => {
    it('should detect collision when circle overlaps obstacle', () => {
      const circlePos: Position = { x: 50, y: 50 };
      const obstaclePos: Position = { x: 40, y: 40 };
      
      const result = checkCollision(
        circlePos, 
        obstaclePos, 
        testConfig.circleRadius, 
        testConfig.obstacleWidth, 
        testConfig.obstacleHeight
      );
      
      expect(result).toBe(true);
    });

    it('should not detect collision when circle is above obstacle', () => {
      const circlePos: Position = { x: 50, y: 10 };
      const obstaclePos: Position = { x: 50, y: 100 };
      
      const result = checkCollision(
        circlePos, 
        obstaclePos, 
        testConfig.circleRadius, 
        testConfig.obstacleWidth, 
        testConfig.obstacleHeight
      );
      
      expect(result).toBe(false);
    });

    it('should not detect collision when circle is below obstacle', () => {
      const circlePos: Position = { x: 50, y: 200 };
      const obstaclePos: Position = { x: 50, y: 100 };
      
      const result = checkCollision(
        circlePos, 
        obstaclePos, 
        testConfig.circleRadius, 
        testConfig.obstacleWidth, 
        testConfig.obstacleHeight
      );
      
      expect(result).toBe(false);
    });

    it('should not detect collision when circle is left of obstacle', () => {
      const circlePos: Position = { x: 10, y: 50 };
      const obstaclePos: Position = { x: 200, y: 50 };
      
      const result = checkCollision(
        circlePos, 
        obstaclePos, 
        testConfig.circleRadius, 
        testConfig.obstacleWidth, 
        testConfig.obstacleHeight
      );
      
      expect(result).toBe(false);
    });

    it('should not detect collision when circle is right of obstacle', () => {
      const circlePos: Position = { x: 300, y: 50 };
      const obstaclePos: Position = { x: 100, y: 50 };
      
      const result = checkCollision(
        circlePos, 
        obstaclePos, 
        testConfig.circleRadius, 
        testConfig.obstacleWidth, 
        testConfig.obstacleHeight
      );
      
      expect(result).toBe(false);
    });
  });

  describe('checkWinCondition', () => {
    it('should return true when circle reaches bottom', () => {
      const circlePos: Position = { x: 50, y: testConfig.gameHeight - 50 };
      
      const result = checkWinCondition(
        circlePos, 
        testConfig.gameHeight, 
        testConfig.circleRadius
      );
      
      expect(result).toBe(true);
    });

    it('should return false when circle is not at bottom', () => {
      const circlePos: Position = { x: 50, y: 100 };
      
      const result = checkWinCondition(
        circlePos, 
        testConfig.gameHeight, 
        testConfig.circleRadius
      );
      
      expect(result).toBe(false);
    });
  });

  describe('updateObstaclePosition', () => {
    it('should move obstacle right when direction is right', () => {
      const currentPos: Position = { x: 50, y: 100 };
      const direction = 'right' as const;
      
      const result = updateObstaclePosition(
        currentPos,
        direction,
        testConfig.obstacleSpeed,
        testConfig.gameWidth,
        testConfig.obstacleWidth
      );
      
      expect(result.newPosition.x).toBe(52); // 50 + 2
      expect(result.newPosition.y).toBe(100);
      expect(result.newDirection).toBe('right');
    });

    it('should move obstacle left when direction is left', () => {
      const currentPos: Position = { x: 50, y: 100 };
      const direction = 'left' as const;
      
      const result = updateObstaclePosition(
        currentPos,
        direction,
        testConfig.obstacleSpeed,
        testConfig.gameWidth,
        testConfig.obstacleWidth
      );
      
      expect(result.newPosition.x).toBe(48); // 50 - 2
      expect(result.newPosition.y).toBe(100);
      expect(result.newDirection).toBe('left');
    });

    it('should change direction to left when hitting right boundary', () => {
      const currentPos: Position = { x: testConfig.gameWidth - testConfig.obstacleWidth - 1, y: 100 };
      const direction = 'right' as const;
      
      const result = updateObstaclePosition(
        currentPos,
        direction,
        testConfig.obstacleSpeed,
        testConfig.gameWidth,
        testConfig.obstacleWidth
      );
      
      expect(result.newDirection).toBe('left');
    });

    it('should change direction to right when hitting left boundary', () => {
      const currentPos: Position = { x: 1, y: 100 };
      const direction = 'left' as const;
      
      const result = updateObstaclePosition(
        currentPos,
        direction,
        testConfig.obstacleSpeed,
        testConfig.gameWidth,
        testConfig.obstacleWidth
      );
      
      expect(result.newDirection).toBe('right');
    });
  });

  describe('calculateCirclePosition', () => {
    it('should calculate position within bounds', () => {
      const mouseX = 100;
      const mouseY = 150;
      const dragOffset: Position = { x: 10, y: 5 };
      
      const result = calculateCirclePosition(
        mouseX,
        mouseY,
        dragOffset,
        testConfig.gameWidth,
        testConfig.gameHeight,
        testConfig.circleRadius
      );
      
      expect(result.x).toBe(90); // 100 - 10
      expect(result.y).toBe(145); // 150 - 5
    });

    it('should clamp position to left boundary', () => {
      const mouseX = 5;
      const mouseY = 150;
      const dragOffset: Position = { x: 10, y: 5 };
      
      const result = calculateCirclePosition(
        mouseX,
        mouseY,
        dragOffset,
        testConfig.gameWidth,
        testConfig.gameHeight,
        testConfig.circleRadius
      );
      
      expect(result.x).toBe(0); // Clamped to 0
      expect(result.y).toBe(145);
    });

    it('should clamp position to right boundary', () => {
      const mouseX = testConfig.gameWidth + 10;
      const mouseY = 150;
      const dragOffset: Position = { x: 10, y: 5 };
      
      const result = calculateCirclePosition(
        mouseX,
        mouseY,
        dragOffset,
        testConfig.gameWidth,
        testConfig.gameHeight,
        testConfig.circleRadius
      );
      
      expect(result.x).toBe(testConfig.gameWidth - testConfig.circleRadius * 2); // Clamped to max
      expect(result.y).toBe(145);
    });
  });

  describe('isMouseInCircle', () => {
    it('should return true when mouse is inside circle', () => {
      const mouseX = 50;
      const mouseY = 50;
      const circlePos: Position = { x: 40, y: 40 };
      
      const result = isMouseInCircle(mouseX, mouseY, circlePos, testConfig.circleRadius);
      
      expect(result).toBe(true);
    });

    it('should return false when mouse is outside circle', () => {
      const mouseX = 100;
      const mouseY = 100;
      const circlePos: Position = { x: 40, y: 40 };
      
      const result = isMouseInCircle(mouseX, mouseY, circlePos, testConfig.circleRadius);
      
      expect(result).toBe(false);
    });

    it('should return true when mouse is exactly on circle edge', () => {
      const mouseX = 40 + testConfig.circleRadius;
      const mouseY = 40;
      const circlePos: Position = { x: 40, y: 40 };
      
      const result = isMouseInCircle(mouseX, mouseY, circlePos, testConfig.circleRadius);
      
      expect(result).toBe(true);
    });
  });

  describe('calculateDragOffset', () => {
    it('should calculate correct drag offset', () => {
      const mouseX = 100;
      const mouseY = 150;
      const circlePos: Position = { x: 80, y: 120 };
      
      const result = calculateDragOffset(mouseX, mouseY, circlePos);
      
      expect(result.x).toBe(20); // 100 - 80
      expect(result.y).toBe(30); // 150 - 120
    });
  });

  describe('getInitialGameState', () => {
    it('should return correct initial state', () => {
      const result = getInitialGameState(testConfig);
      
      expect(result.circlePosition.x).toBe(testConfig.gameWidth / 2 - testConfig.circleRadius);
      expect(result.circlePosition.y).toBe(20);
      expect(result.obstaclePosition.x).toBe(0);
      expect(result.obstaclePosition.y).toBe(testConfig.gameHeight / 2 - testConfig.obstacleHeight / 2);
      expect(result.obstacleDirection).toBe('right');
      expect(result.gameWon).toBe(false);
      expect(result.gameLost).toBe(false);
    });
  });

  describe('processGameTick', () => {
    it('should continue game when no collision or win', () => {
      const currentState: GameState = {
        circlePosition: { x: 50, y: 50 },
        obstaclePosition: { x: 100, y: 100 },
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      
      const result = processGameTick(currentState, testConfig);
      
      expect(result.shouldEndGame).toBe(false);
      expect(result.gameResult.type).toBe(null);
      expect(result.newState.gameWon).toBe(false);
      expect(result.newState.gameLost).toBe(false);
      expect(result.newState.obstaclePosition.x).toBe(102); // 100 + 2
    });

    it('should detect collision and end game', () => {
      const currentState: GameState = {
        circlePosition: { x: 50, y: 50 },
        obstaclePosition: { x: 40, y: 40 }, // Overlapping with circle
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      
      const result = processGameTick(currentState, testConfig);
      
      expect(result.shouldEndGame).toBe(true);
      expect(result.gameResult.type).toBe('lost');
      expect(result.newState.gameLost).toBe(true);
    });

    it('should detect win condition and end game', () => {
      const currentState: GameState = {
        circlePosition: { x: 50, y: testConfig.gameHeight - 50 }, // Near bottom
        obstaclePosition: { x: 100, y: 100 },
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      
      const result = processGameTick(currentState, testConfig);
      
      expect(result.shouldEndGame).toBe(true);
      expect(result.gameResult.type).toBe('won');
      expect(result.newState.gameWon).toBe(true);
    });

    it('should not process when game is already won', () => {
      const currentState: GameState = {
        circlePosition: { x: 50, y: 50 },
        obstaclePosition: { x: 100, y: 100 },
        obstacleDirection: 'right',
        gameWon: true,
        gameLost: false
      };
      
      const result = processGameTick(currentState, testConfig);
      
      expect(result.shouldEndGame).toBe(false);
      expect(result.gameResult.type).toBe(null);
      expect(result.newState).toEqual(currentState);
    });

    it('should not process when game is already lost', () => {
      const currentState: GameState = {
        circlePosition: { x: 50, y: 50 },
        obstaclePosition: { x: 100, y: 100 },
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: true
      };
      
      const result = processGameTick(currentState, testConfig);
      
      expect(result.shouldEndGame).toBe(false);
      expect(result.gameResult.type).toBe(null);
      expect(result.newState).toEqual(currentState);
    });
  });
}); 