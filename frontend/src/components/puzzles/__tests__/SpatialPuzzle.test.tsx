import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpatialPuzzle } from '../SpatialPuzzle';

// Mock the spatial puzzle logic
vi.mock('../../../services/spatialPuzzleLogic', () => ({
  checkCollision: vi.fn(() => false),
  checkWinCondition: vi.fn(() => false),
  updateObstaclePosition: vi.fn(() => ({
    newPosition: { x: 170, y: 300 },
    newDirection: 'right' as const,
  })),
  calculateCirclePosition: vi.fn(() => ({ x: 210, y: 60 })),
  isMouseInCircle: vi.fn(() => true),
  calculateDragOffset: vi.fn(() => ({ x: 10, y: 10 })),
  getInitialGameState: vi.fn(() => ({
    circlePosition: { x: 200, y: 50 },
    obstaclePosition: { x: 160, y: 300 },
    obstacleDirection: 'right' as const,
    gameWon: false,
    gameLost: false,
  })),
  processGameTick: vi.fn(),
  getDefaultGameConfig: vi.fn(() => ({
    gameWidth: 400,
    gameHeight: 600,
    circleRadius: 20,
    obstacleWidth: 80,
    obstacleHeight: 30,
    obstacleSpeed: 10.0
  })),
  validateGameConfig: vi.fn(() => ({ isValid: true, errors: [] })),
}));

// Mock the design system components
vi.mock('../../design-system/Card', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
}));

// Mock the custom hooks
vi.mock('../../../hooks/useSpatialGameState', () => ({
  useSpatialGameState: vi.fn(() => ({
    gameState: {
      circlePosition: { x: 200, y: 50 },
      obstaclePosition: { x: 160, y: 300 },
      obstacleDirection: 'right' as const,
      gameWon: false,
      gameLost: false,
    },
    isGameActive: true,
    setCirclePosition: vi.fn(),
    setObstaclePosition: vi.fn(),
    setObstacleDirection: vi.fn(),
    setGameWon: vi.fn(),
    setGameLost: vi.fn(),
  })),
}));

vi.mock('../../../hooks/useSpatialGameLoop', () => ({
  useSpatialGameLoop: vi.fn(() => ({
    startGameLoop: vi.fn(),
    stopGameLoop: vi.fn(),
  })),
}));

vi.mock('../../../hooks/useSpatialMouseHandling', () => ({
  useSpatialMouseHandling: vi.fn(() => ({
    containerRef: { current: null },
    isDragging: false,
    handleMouseDown: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseUp: vi.fn(),
    handleMouseLeave: vi.fn(),
  })),
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true,
});

describe('SpatialPuzzle', () => {
  const mockPuzzle = {
    id: 1,
    type: 'spatial',
    data: {},
  };

  const mockProps = {
    puzzle: mockPuzzle,
    answer: '',
    setAnswer: vi.fn(),
    submitAnswer: vi.fn(),
    submitAnswerWithAnswer: vi.fn(),
    loading: false,
    feedback: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('displays game elements correctly', () => {
    render(<SpatialPuzzle {...mockProps} />);
    // Check for the circle element
    const circle = document.querySelector('.spatial-puzzle-circle');
    expect(circle).toBeInTheDocument();
    // Check for the obstacle element (orange color)
    const obstacle = document.querySelector('.spatial-puzzle-obstacle');
    expect(obstacle).toBeInTheDocument();
  });

  it('shows overlays and feedback correctly', () => {
    // Loading overlay
    render(<SpatialPuzzle {...mockProps} loading={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    // Feedback overlay
    const feedback = 'Great job! You solved it!';
    render(<SpatialPuzzle {...mockProps} feedback={feedback} loading={false} />);
    expect(screen.getByText(feedback)).toBeInTheDocument();
  });

  it('handles mouse events correctly', () => {
    render(<SpatialPuzzle {...mockProps} />);
    const gameArea = screen.getByTestId('spatial-puzzle-area');
    // Mock getBoundingClientRect
    const mockRect = {
      left: 0,
      top: 0,
      width: 400,
      height: 600,
    };
    gameArea!.getBoundingClientRect = vi.fn().mockReturnValue(mockRect);
    // Test mouse down
    fireEvent.mouseDown(gameArea!, { clientX: 210, clientY: 60 });
    // Test mouse move
    fireEvent.mouseMove(gameArea!, { clientX: 220, clientY: 70 });
    // Test mouse up
    fireEvent.mouseUp(gameArea!);
    // Test mouse leave
    fireEvent.mouseLeave(gameArea!);
    // The component should handle these events without crashing
    expect(gameArea).toBeInTheDocument();
  });

  it('should not immediately show win message on mount (initial circle at top)', () => {
    render(<SpatialPuzzle {...mockProps} />);
    // Should not show the win message
    expect(screen.queryByText('You reached the bottom safely!')).toBeNull();
  });
});

describe('Readonly/Spectator Mode', () => {
  const mockPuzzle = {
    id: 1,
    type: 'spatial',
    data: {},
  };

  const mockProps = {
    puzzle: mockPuzzle,
    answer: '',
    setAnswer: vi.fn(),
    submitAnswer: vi.fn(),
    submitAnswerWithAnswer: vi.fn(),
    loading: false,
    feedback: '',
    readonly: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should disable mouse events and show spectating overlay in readonly mode', () => {
    render(<SpatialPuzzle {...mockProps} readonly={true} />);
    // Spectating overlay should be visible
    expect(screen.getByText('Spectating')).toBeInTheDocument();
    // Mouse events should not trigger handlers
    const gameArea = screen.getByTestId('spatial-puzzle-area');
    fireEvent.mouseDown(gameArea!);
    fireEvent.mouseMove(gameArea!);
    fireEvent.mouseUp(gameArea!);
    fireEvent.mouseLeave(gameArea!);
    // No errors should occur and overlay is present
    expect(gameArea).toBeInTheDocument();
  });
});
