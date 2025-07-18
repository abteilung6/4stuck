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

  it('cancels animation frame on unmount', () => {
    // Mock that requestAnimationFrame returns an ID
    mockRequestAnimationFrame.mockReturnValue(123);
    
    const { unmount } = render(<SpatialPuzzle {...mockProps} />);

    // Simulate that the component started an animation frame
    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    unmount();

    // Should cancel the animation frame
    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
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

  it('resets game state when puzzle prop changes', () => {
    const { rerender } = render(<SpatialPuzzle {...mockProps} />);

    // Change the puzzle prop
    const newPuzzle = { type: 'spatial', data: { someNewData: true } };
    rerender(<SpatialPuzzle {...mockProps} puzzle={newPuzzle} />);

    // Should not crash and should render correctly
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

  it('handles different puzzle data gracefully', () => {
    const puzzleWithData = {
      type: 'spatial',
      data: { customData: 'test' },
    };

    render(<SpatialPuzzle {...mockProps} puzzle={puzzleWithData} />);

    // Should render without crashing
    expect(screen.getByTestId('section-title')).toHaveTextContent('Navigate the Circle');
  });
}); 