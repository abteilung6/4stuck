import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

vi.mock('../../design-system/SectionTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h2 data-testid="section-title">{children}</h2>,
}));

vi.mock('../../design-system/Typography', () => ({
  BodyText: ({ children }: { children: React.ReactNode }) => <p data-testid="body-text">{children}</p>,
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

  it('renders the puzzle with correct title and instructions', () => {
    render(<SpatialPuzzle {...mockProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent('Navigate the Circle');
    expect(screen.getByTestId('body-text')).toHaveTextContent(
      'Drag the blue circle from the top to the bottom without touching the orange obstacle!'
    );
  });

  it('displays the game area with correct dimensions', () => {
    render(<SpatialPuzzle {...mockProps} />);

    const gameArea = screen.getByTestId('card').querySelector('.spatial-puzzle-game-area');
    expect(gameArea).toHaveStyle({
      width: '400px',
      height: '600px',
    });
  });

  it('shows start and end zone indicators', () => {
    render(<SpatialPuzzle {...mockProps} />);

    // Check for start and end zone indicators (green dashed borders)
    const zones = document.querySelectorAll('[style*="border: 2px dashed rgb(0, 255, 0)"]');
    expect(zones.length).toBeGreaterThan(0);
  });

  it('shows loading overlay when loading prop is true', () => {
    render(<SpatialPuzzle {...mockProps} loading={true} />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('shows feedback when provided', () => {
    const feedback = 'Great job! You solved it!';
    render(<SpatialPuzzle {...mockProps} feedback={feedback} />);

    expect(screen.getByText(feedback)).toBeInTheDocument();
  });

  it('handles unmount gracefully', () => {
    const { unmount } = render(<SpatialPuzzle {...mockProps} />);

    // Should not crash on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('handles mouse events correctly', () => {
    render(<SpatialPuzzle {...mockProps} />);

    const gameArea = screen.getByTestId('card').querySelector('.spatial-puzzle-game-area');
    
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

  it('should reset game state when puzzle changes', () => {
    const { rerender } = render(<SpatialPuzzle {...mockProps} />);

    // Change puzzle
    const newPuzzle = { id: 3, type: 'spatial', data: { someNewData: true } };
    rerender(<SpatialPuzzle {...mockProps} puzzle={newPuzzle} />);

    // Should render without errors
    expect(screen.getByTestId('section-title')).toHaveTextContent('Navigate the Circle');
  });

  it('displays game elements correctly', () => {
    render(<SpatialPuzzle {...mockProps} />);

    // Check for the circle element
    const circle = document.querySelector('[style*="border-radius: 50%"]');
    expect(circle).toBeInTheDocument();

    // Check for the obstacle element (orange color)
    const obstacle = document.querySelector('[style*="background-color: rgb(255, 140, 0)"]');
    expect(obstacle).toBeInTheDocument();
  });



  it('maintains proper game configuration', () => {
    render(<SpatialPuzzle {...mockProps} />);

    const gameArea = screen.getByTestId('card').querySelector('.spatial-puzzle-game-area');
    
    // Verify game area has proper styling
    expect(gameArea).toHaveStyle({
      position: 'relative',
      border: '2px solid rgb(51, 51, 51)',
      borderRadius: '8px',
      backgroundColor: 'rgb(240, 240, 240)',
      overflow: 'hidden',
    });
  });

  it('should handle different puzzle data gracefully', () => {
    const puzzleWithData = {
      id: 2,
      type: 'spatial',
      data: { someCustomData: 'value' },
    };

    render(<SpatialPuzzle {...mockProps} puzzle={puzzleWithData} />);

    // Should render without errors
    expect(screen.getByTestId('section-title')).toHaveTextContent('Navigate the Circle');
  });
}); 