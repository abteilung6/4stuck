import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ConcentrationPuzzle from '../ConcentrationPuzzle';
import * as concentrationPuzzleLogic from '../../../services/concentrationPuzzleLogic';
import { useConcentrationGameState } from '../../../hooks/useConcentrationGameState';

// Mock the concentration puzzle logic
vi.mock('../../../services/concentrationPuzzleLogic', () => ({
  getColorValue: vi.fn((color) => {
    const colorMap: { [key: string]: string } = {
      red: '#ff4444',
      blue: '#4444ff',
      yellow: '#ffff44',
      green: '#44ff44'
    };
    return colorMap[color] || '#888888';
  }),
  validateConcentrationPuzzleData: vi.fn(() => ({ isValid: true, errors: [] })),
  getGameProgress: vi.fn(() => 33),
  getCurrentPair: vi.fn(),
  processConcentrationClick: vi.fn(),
  shouldAutoAdvance: vi.fn(),
  autoAdvancePair: vi.fn()
}));

// Mock the concentration game state hook
vi.mock('../../../hooks/useConcentrationGameState', () => ({
  useConcentrationGameState: vi.fn()
}));

describe('ConcentrationPuzzle Integration Tests', () => {
  const mockPuzzle = {
    id: 1,
    type: 'concentration',
    data: {
      pairs: [
        { color_word: 'red', circle_color: 'blue', is_match: false },
        { color_word: 'blue', circle_color: 'blue', is_match: true },
        { color_word: 'green', circle_color: 'yellow', is_match: false }
      ],
      duration: 2
    }
  };

  const mockProps = {
    puzzle: mockPuzzle,
    onSolve: vi.fn(),
    onFail: vi.fn()
  };

  let mockUseConcentrationGameState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset validation to pass by default
    (concentrationPuzzleLogic.validateConcentrationPuzzleData as any).mockReturnValue({
      isValid: true,
      errors: []
    });

    // Setup default mock for the hook
    mockUseConcentrationGameState = {
      gameState: {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      },
      currentPair: {
        color_word: 'red',
        circle_color: 'blue',
        is_match: false
      },
      isGameActive: true,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    };

    (useConcentrationGameState as any).mockReturnValue(mockUseConcentrationGameState);
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('should handle basic game flow with clicks', () => {
    const mockHandleClick = vi.fn();
    mockUseConcentrationGameState.handleClick = mockHandleClick;

    render(<ConcentrationPuzzle {...mockProps} />);

    // Should show first pair
    expect(screen.getByText('RED')).toBeInTheDocument();
    expect(screen.getByText("Don't click - text and color don't match!")).toBeInTheDocument();

    // Click on the circle
    const circle = screen.getByTestId('color-circle');
    fireEvent.click(circle);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it('should display success state correctly', () => {
    // Mock successful completion
    mockUseConcentrationGameState.gameState = {
      currentIndex: 1,
      hasClicked: true,
      isComplete: true,
      gameResult: 'success',
      clickedIndex: 1
    };
    mockUseConcentrationGameState.currentPair = null;
    mockUseConcentrationGameState.isGameActive = false;

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Success! 🎉')).toBeInTheDocument();
    expect(screen.getByText('You clicked at the right time!')).toBeInTheDocument();
  });

  it('should display failure state correctly', () => {
    // Mock failure due to wrong click
    mockUseConcentrationGameState.gameState = {
      currentIndex: 0,
      hasClicked: true,
      isComplete: true,
      gameResult: 'failure',
      clickedIndex: 0
    };
    mockUseConcentrationGameState.currentPair = null;
    mockUseConcentrationGameState.isGameActive = false;

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Game Over! 💥')).toBeInTheDocument();
    expect(screen.getByText('You clicked at the wrong time. Try again!')).toBeInTheDocument();
  });

  it('should display timeout failure state correctly', () => {
    // Mock failure due to timeout
    mockUseConcentrationGameState.gameState = {
      currentIndex: 0,
      hasClicked: false,
      isComplete: true,
      gameResult: 'failure',
      clickedIndex: null
    };
    mockUseConcentrationGameState.currentPair = null;
    mockUseConcentrationGameState.isGameActive = false;

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Game Over! 💥')).toBeInTheDocument();
    expect(screen.getByText("Time's up! You didn't click in time. Try again!")).toBeInTheDocument();
  });

  it('should reset game when retry button is clicked', () => {
    const mockResetGame = vi.fn();

    // Mock game over state
    mockUseConcentrationGameState.gameState = {
      currentIndex: 0,
      hasClicked: true,
      isComplete: true,
      gameResult: 'failure',
      clickedIndex: 0
    };
    mockUseConcentrationGameState.currentPair = null;
    mockUseConcentrationGameState.isGameActive = false;
    mockUseConcentrationGameState.resetGame = mockResetGame;

    render(<ConcentrationPuzzle {...mockProps} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });

  it('should show progress through multiple pairs', () => {
    // Mock progression through pairs
    mockUseConcentrationGameState.gameState.currentIndex = 1;
    mockUseConcentrationGameState.currentPair = {
      color_word: 'blue',
      circle_color: 'blue',
      is_match: true
    };

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Pair 2 / 3')).toBeInTheDocument();
    expect(screen.getByText('BLUE')).toBeInTheDocument();
    expect(screen.getByText('Click the circle - text and color match!')).toBeInTheDocument();
  });

  it('should handle invalid puzzle data gracefully', () => {
    (concentrationPuzzleLogic.validateConcentrationPuzzleData as any).mockReturnValue({
      isValid: false,
      errors: ['Missing pairs data', 'Invalid duration']
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Invalid Puzzle Data')).toBeInTheDocument();
    expect(screen.getByText('The puzzle data is invalid. Please try again.')).toBeInTheDocument();
  });

  it('should show loading state when currentPair is null', () => {
    mockUseConcentrationGameState.currentPair = null;
    mockUseConcentrationGameState.isGameActive = true;

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Loading puzzle...')).toBeInTheDocument();
  });

  it('should display correct color styling', () => {
    // Test red word with blue circle
    mockUseConcentrationGameState.currentPair = {
      color_word: 'red',
      circle_color: 'blue',
      is_match: false
    };

    render(<ConcentrationPuzzle {...mockProps} />);

    const colorWord = screen.getByText('RED');
    const circle = screen.getByTestId('color-circle');

    expect(colorWord).toHaveStyle({ color: '#ff4444' }); // red text
    expect(circle).toHaveStyle({ backgroundColor: '#4444ff' }); // blue background
  });

  it('should handle rapid clicking without breaking', () => {
    const mockHandleClick = vi.fn();
    mockUseConcentrationGameState.handleClick = mockHandleClick;

    render(<ConcentrationPuzzle {...mockProps} />);

    const circle = screen.getByTestId('color-circle');

    // Rapid clicks
    fireEvent.click(circle);
    fireEvent.click(circle);
    fireEvent.click(circle);
    fireEvent.click(circle);
    fireEvent.click(circle);

    expect(mockHandleClick).toHaveBeenCalledTimes(5);
  });

  it('should maintain game state consistency during interactions', () => {
    const mockHandleClick = vi.fn();
    const mockResetGame = vi.fn();

    mockUseConcentrationGameState.handleClick = mockHandleClick;
    mockUseConcentrationGameState.resetGame = mockResetGame;

    render(<ConcentrationPuzzle {...mockProps} />);

    // Verify initial state
    expect(screen.getByText('Pair 1 / 3')).toBeInTheDocument();
    expect(screen.getByText("Don't click - text and color don't match!")).toBeInTheDocument();

    // Click and verify state maintained
    const circle = screen.getByTestId('color-circle');
    fireEvent.click(circle);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Pair 1 / 3')).toBeInTheDocument(); // Progress should still show
  });

  it('should handle matching pair display correctly', () => {
    mockUseConcentrationGameState.currentPair = {
      color_word: 'blue',
      circle_color: 'blue',
      is_match: true
    };

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('BLUE')).toBeInTheDocument();
    expect(screen.getByText('Click the circle - text and color match!')).toBeInTheDocument();
  });

  it('should show click feedback when clicked', () => {
    mockUseConcentrationGameState.gameState.hasClicked = true;
    mockUseConcentrationGameState.currentPair = {
      color_word: 'red',
      circle_color: 'blue',
      is_match: false
    };

    render(<ConcentrationPuzzle {...mockProps} />);

    const circle = screen.getByTestId('color-circle');
    expect(circle).toHaveClass('clicked');

    // Should show feedback symbol
    expect(screen.getByText('✗')).toBeInTheDocument(); // Wrong click
  });

  it('should show correct feedback for matching clicks', () => {
    mockUseConcentrationGameState.gameState.hasClicked = true;
    mockUseConcentrationGameState.currentPair = {
      color_word: 'blue',
      circle_color: 'blue',
      is_match: true
    };

    render(<ConcentrationPuzzle {...mockProps} />);

    // Should show correct feedback symbol
    expect(screen.getByText('✓')).toBeInTheDocument(); // Correct click
  });
});
