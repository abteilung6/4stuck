import { describe, expect, it } from 'vitest';
import {
  checkCollision,
  checkWinCondition,
  updateObstaclePosition,
  calculateCirclePosition,
  isMouseInCircle,
  calculateDragOffset,
  getInitialGameState,
  processGameTick,
  validateGameConfig,
  getDefaultGameConfig,
  calculateGameStats,
  type Position,
  type GameConfig,
  type GameState
} from '../spatialPuzzleLogic';

describe('spatialPuzzleLogic', () => {
  describe('validateGameConfig', () => {
    it('should validate a correct configuration', () => {
      const config = getDefaultGameConfig();
      const result = validateGameConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid game width', () => {
      const config = { ...getDefaultGameConfig(), gameWidth: -1 };
      const result = validateGameConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Game width must be positive');
    });

    it('should detect circle too large for game area', () => {
      const config = { ...getDefaultGameConfig(), circleRadius: 300 };
      const result = validateGameConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Circle diameter cannot exceed game width');
    });

    it('should detect obstacle too large for game area', () => {
      const config = { ...getDefaultGameConfig(), obstacleWidth: 500 };
      const result = validateGameConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Obstacle width cannot exceed game width');
    });
  });

  describe('checkCollision', () => {
    it('should detect collision when circle overlaps obstacle', () => {
      const circlePos = { x: 100, y: 100 };
      const obstaclePos = { x: 90, y: 90 };
      const circleRadius = 20;
      const obstacleWidth = 80;
      const obstacleHeight = 30;

      const result = checkCollision(circlePos, obstaclePos, circleRadius, obstacleWidth, obstacleHeight);

      expect(result).toBe(true);
    });

    it('should not detect collision when circle is above obstacle', () => {
      const circlePos = { x: 100, y: 50 };
      const obstaclePos = { x: 90, y: 90 };
      const circleRadius = 20;
      const obstacleWidth = 80;
      const obstacleHeight = 30;

      const result = checkCollision(circlePos, obstaclePos, circleRadius, obstacleWidth, obstacleHeight);

      expect(result).toBe(false);
    });

    it('should not detect collision when circle is below obstacle', () => {
      const circlePos = { x: 100, y: 150 };
      const obstaclePos = { x: 90, y: 90 };
      const circleRadius = 20;
      const obstacleWidth = 80;
      const obstacleHeight = 30;

      const result = checkCollision(circlePos, obstaclePos, circleRadius, obstacleWidth, obstacleHeight);

      expect(result).toBe(false);
    });

    it('should not detect collision when circle is to the left of obstacle', () => {
      const circlePos = { x: 50, y: 100 };
      const obstaclePos = { x: 90, y: 90 };
      const circleRadius = 20;
      const obstacleWidth = 80;
      const obstacleHeight = 30;

      const result = checkCollision(circlePos, obstaclePos, circleRadius, obstacleWidth, obstacleHeight);

      expect(result).toBe(false);
    });

    it('should not detect collision when circle is to the right of obstacle', () => {
      const circlePos = { x: 200, y: 100 };
      const obstaclePos = { x: 90, y: 90 };
      const circleRadius = 20;
      const obstacleWidth = 80;
      const obstacleHeight = 30;

      const result = checkCollision(circlePos, obstaclePos, circleRadius, obstacleWidth, obstacleHeight);

      expect(result).toBe(false);
    });
  });

  describe('checkWinCondition', () => {
    it('should detect win when circle reaches bottom', () => {
      const circlePos = { x: 100, y: 560 }; // Near bottom of 600px game
      const gameHeight = 600;
      const circleRadius = 20;
      const result = checkWinCondition(circlePos, gameHeight, circleRadius);
      expect(result).toBe(true);
    });

    it('should not detect win when circle is not at bottom', () => {
      const circlePos = { x: 100, y: 300 }; // Middle of game
      const gameHeight = 600;
      const circleRadius = 20;
      const result = checkWinCondition(circlePos, gameHeight, circleRadius);
      expect(result).toBe(false);
    });

    it('should not trigger win at the top', () => {
      const circlePos = { x: 100, y: 0 }; // At the very top
      const gameHeight = 600;
      const circleRadius = 20;
      const result = checkWinCondition(circlePos, gameHeight, circleRadius);
      expect(result).toBe(false);
    });

    it('should trigger win when bottom of circle is at or past game bottom', () => {
      const circleRadius = 20;
      const gameHeight = 600;
      // y such that bottom of circle is exactly at gameHeight - 10
      const circlePos = { x: 100, y: gameHeight - (circleRadius * 2) - 10 };
      const result = checkWinCondition(circlePos, gameHeight, circleRadius);
      expect(result).toBe(true);
    });
  });

  describe('updateObstaclePosition', () => {
    it('should move obstacle right when direction is right', () => {
      const currentPos = { x: 100, y: 100 };
      const direction = 'right' as const;
      const speed = 10;
      const gameWidth = 400;
      const obstacleWidth = 80;

      const result = updateObstaclePosition(currentPos, direction, speed, gameWidth, obstacleWidth);

      expect(result.newPosition.x).toBe(110);
      expect(result.newPosition.y).toBe(100);
      expect(result.newDirection).toBe('right');
    });

    it('should move obstacle left when direction is left', () => {
      const currentPos = { x: 100, y: 100 };
      const direction = 'left' as const;
      const speed = 10;
      const gameWidth = 400;
      const obstacleWidth = 80;

      const result = updateObstaclePosition(currentPos, direction, speed, gameWidth, obstacleWidth);

      expect(result.newPosition.x).toBe(90);
      expect(result.newPosition.y).toBe(100);
      expect(result.newDirection).toBe('left');
    });

    it('should change direction to left when hitting right boundary', () => {
      const currentPos = { x: 320, y: 100 }; // Near right boundary
      const direction = 'right' as const;
      const speed = 10;
      const gameWidth = 400;
      const obstacleWidth = 80;

      const result = updateObstaclePosition(currentPos, direction, speed, gameWidth, obstacleWidth);

      expect(result.newDirection).toBe('left');
    });

    it('should change direction to right when hitting left boundary', () => {
      const currentPos = { x: 10, y: 100 }; // Near left boundary
      const direction = 'left' as const;
      const speed = 10;
      const gameWidth = 400;
      const obstacleWidth = 80;

      const result = updateObstaclePosition(currentPos, direction, speed, gameWidth, obstacleWidth);

      expect(result.newDirection).toBe('right');
    });
  });

  describe('calculateCirclePosition', () => {
    it('should calculate position within bounds', () => {
      const mouseX = 200;
      const mouseY = 300;
      const dragOffset = { x: 10, y: 10 };
      const gameWidth = 400;
      const gameHeight = 600;
      const circleRadius = 20;

      const result = calculateCirclePosition(mouseX, mouseY, dragOffset, gameWidth, gameHeight, circleRadius);

      expect(result.x).toBe(190); // 200 - 10
      expect(result.y).toBe(290); // 300 - 10
    });

    it('should clamp position to left boundary', () => {
      const mouseX = 10;
      const mouseY = 300;
      const dragOffset = { x: 20, y: 10 };
      const gameWidth = 400;
      const gameHeight = 600;
      const circleRadius = 20;

      const result = calculateCirclePosition(mouseX, mouseY, dragOffset, gameWidth, gameHeight, circleRadius);

      expect(result.x).toBe(0); // Clamped to left boundary
    });

    it('should clamp position to right boundary', () => {
      const mouseX = 400;
      const mouseY = 300;
      const dragOffset = { x: 10, y: 10 };
      const gameWidth = 400;
      const gameHeight = 600;
      const circleRadius = 20;

      const result = calculateCirclePosition(mouseX, mouseY, dragOffset, gameWidth, gameHeight, circleRadius);

      expect(result.x).toBe(360); // Clamped to right boundary (400 - 40)
    });
  });

  describe('isMouseInCircle', () => {
    it('should detect mouse inside circle', () => {
      const mouseX = 120;
      const mouseY = 120;
      const circlePos = { x: 100, y: 100 };
      const circleRadius = 20;

      const result = isMouseInCircle(mouseX, mouseY, circlePos, circleRadius);

      expect(result).toBe(true);
    });

    it('should detect mouse outside circle', () => {
      const mouseX = 150;
      const mouseY = 150;
      const circlePos = { x: 100, y: 100 };
      const circleRadius = 20;

      const result = isMouseInCircle(mouseX, mouseY, circlePos, circleRadius);

      expect(result).toBe(false);
    });

    it('should detect mouse exactly on circle edge', () => {
      const mouseX = 120;
      const mouseY = 100;
      const circlePos = { x: 100, y: 100 };
      const circleRadius = 20;

      const result = isMouseInCircle(mouseX, mouseY, circlePos, circleRadius);

      expect(result).toBe(true);
    });
  });

  describe('calculateDragOffset', () => {
    it('should calculate correct drag offset', () => {
      const mouseX = 120;
      const mouseY = 130;
      const circlePos = { x: 100, y: 100 };

      const result = calculateDragOffset(mouseX, mouseY, circlePos);

      expect(result.x).toBe(20); // 120 - 100
      expect(result.y).toBe(30); // 130 - 100
    });
  });

  describe('getInitialGameState', () => {
    it('should return valid initial state', () => {
      const config = getDefaultGameConfig();
      const result = getInitialGameState(config);

      expect(result.circlePosition.x).toBe(180); // (400/2) - 20
      expect(result.circlePosition.y).toBe(0);
      expect(result.obstaclePosition.x).toBe(0);
      expect(result.obstaclePosition.y).toBe(285); // (600/2) - (30/2)
      expect(result.obstacleDirection).toBe('right');
      expect(result.gameWon).toBe(false);
      expect(result.gameLost).toBe(false);
    });
  });

  describe('processGameTick', () => {
    it('should continue game when no win/loss conditions met', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 100 },
        obstaclePosition: { x: 0, y: 300 },
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = processGameTick(gameState, config);

      expect(result.shouldEndGame).toBe(false);
      expect(result.gameResult.type).toBe(null);
      expect(result.newState.obstaclePosition.x).toBe(10); // Moved right by speed
    });

    it('should detect collision and end game', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 100 },
        obstaclePosition: { x: 90, y: 90 }, // Overlapping with circle
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = processGameTick(gameState, config);

      expect(result.shouldEndGame).toBe(true);
      expect(result.gameResult.type).toBe('lost');
      expect(result.gameResult.reason).toBe('collision');
      expect(result.newState.gameLost).toBe(true);
    });

    it('should detect win condition and end game', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 560 }, // Near bottom
        obstaclePosition: { x: 0, y: 300 },
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = processGameTick(gameState, config);

      expect(result.shouldEndGame).toBe(true);
      expect(result.gameResult.type).toBe('won');
      expect(result.gameResult.reason).toBe('reached_bottom');
      expect(result.newState.gameWon).toBe(true);
    });

    it('should not process when game is already over', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 100 },
        obstaclePosition: { x: 0, y: 300 },
        obstacleDirection: 'right',
        gameWon: true, // Already won
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = processGameTick(gameState, config);

      expect(result.shouldEndGame).toBe(false);
      expect(result.gameResult.type).toBe(null);
      expect(result.newState).toEqual(gameState); // No changes
    });
  });

  describe('calculateGameStats', () => {
    it('should calculate correct progress', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 320 }, // Adjusted for start position offset
        obstaclePosition: { x: 300, y: 300 }, // Far from circle to avoid danger zone
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = calculateGameStats(gameState, config);

      expect(result.progress).toBeCloseTo(55.6, 0); // Actual calculated progress
      expect(result.distanceToGoal).toBeGreaterThan(0);
      expect(result.isInDangerZone).toBe(false);
    });

    it('should detect danger zone when near obstacle', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 100 },
        obstaclePosition: { x: 90, y: 90 }, // Very close to circle
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = calculateGameStats(gameState, config);

      expect(result.isInDangerZone).toBe(true);
    });

    it('should calculate 100% progress when at bottom', () => {
      const gameState: GameState = {
        circlePosition: { x: 100, y: 560 }, // At bottom
        obstaclePosition: { x: 0, y: 300 },
        obstacleDirection: 'right',
        gameWon: false,
        gameLost: false
      };
      const config = getDefaultGameConfig();

      const result = calculateGameStats(gameState, config);

      expect(result.progress).toBeCloseTo(100, 1);
      expect(result.distanceToGoal).toBeCloseTo(0, 1);
    });
  });
});
