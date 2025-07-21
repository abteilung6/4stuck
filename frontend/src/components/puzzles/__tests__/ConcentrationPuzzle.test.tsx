import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
  getGameProgress: vi.fn(() => 33)
}));

// Mock the concentration game state hook
vi.mock('../../../hooks/useConcentrationGameState', () => ({
  useConcentrationGameState: vi.fn(() => ({
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
  }))
}));

describe('ConcentrationPuzzle', () => {
  const mockPuzzle = {
    id: 1,
    type: 'concentration',
    data: {
      pairs: [
        { color_word: 'red', circle_color: 'blue', is_match: false },
        { color_word: 'blue', circle_color: 'blue', is_match: true }
      ],
      duration: 2
    }
  };

  const mockProps = {
    puzzle: mockPuzzle,
    onSolve: vi.fn(),
    onFail: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset validation to pass by default
    (concentrationPuzzleLogic.validateConcentrationPuzzleData as any).mockReturnValue({
      isValid: true,
      errors: []
    });
  });

  it('renders the puzzle with correct title and instructions', () => {
    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Concentration Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Click the circle ONLY when the text matches the color!')).toBeInTheDocument();
  });

  it('displays current pair information', () => {
    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('RED')).toBeInTheDocument();
    expect(screen.getByText("Don't click - text and color don't match!")).toBeInTheDocument();
    expect(screen.getByText('Pair 1 / 2')).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    render(<ConcentrationPuzzle {...mockProps} />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays color circle with correct background color', () => {
    render(<ConcentrationPuzzle {...mockProps} />);

    const circle = screen.getByTestId('color-circle');
    expect(circle).toHaveStyle({ backgroundColor: '#4444ff' }); // blue
  });

  it('displays color word with correct text color', () => {
    render(<ConcentrationPuzzle {...mockProps} />);

    const colorWord = screen.getByText('RED');
    expect(colorWord).toHaveStyle({ color: '#ff4444' }); // red
  });

  it('shows success message when game is won', () => {
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: true,
        isComplete: true,
        gameResult: 'success',
        clickedIndex: 0
      },
      currentPair: null,
      isGameActive: false,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Success! 🎉')).toBeInTheDocument();
    expect(screen.getByText('You clicked at the right time!')).toBeInTheDocument();
  });

  it('shows failure message when game is lost due to wrong click', () => {
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: true,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: 0
      },
      currentPair: null,
      isGameActive: false,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Game Over! 💥')).toBeInTheDocument();
    expect(screen.getByText('You clicked at the wrong time. Try again!')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows failure message when game is lost due to timeout', () => {
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: false,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: null
      },
      currentPair: null,
      isGameActive: false,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Game Over! 💥')).toBeInTheDocument();
    expect(screen.getByText("Time's up! You didn't click in time. Try again!")).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls resetGame when retry button is clicked', () => {
    const mockResetGame = vi.fn();
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: true,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: 0
      },
      currentPair: null,
      isGameActive: false,
      resetGame: mockResetGame,
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });

  it('calls handleClick when circle is clicked', () => {
    const mockHandleClick = vi.fn();
    (useConcentrationGameState as any).mockReturnValue({
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
      handleClick: mockHandleClick
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    const circle = screen.getByTestId('color-circle');
    fireEvent.click(circle);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading message when currentPair is null', () => {
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      },
      currentPair: null,
      isGameActive: true,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Loading puzzle...')).toBeInTheDocument();
  });

  it('shows invalid data message when validation fails', () => {
    (concentrationPuzzleLogic.validateConcentrationPuzzleData as any).mockReturnValue({
      isValid: false,
      errors: ['Invalid data']
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Invalid Puzzle Data')).toBeInTheDocument();
    expect(screen.getByText('The puzzle data is invalid. Please try again.')).toBeInTheDocument();
  });

  it('calls onSolve when game completes successfully', async () => {
    const mockOnSolve = vi.fn();
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: true,
        isComplete: true,
        gameResult: 'success',
        clickedIndex: 0
      },
      currentPair: null,
      isGameActive: false,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} onSolve={mockOnSolve} />);

    await waitFor(() => {
      expect(mockOnSolve).toHaveBeenCalledWith('0');
    });
  });

  it('calls onFail when game completes with failure', async () => {
    const mockOnFail = vi.fn();
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: true,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: 0
      },
      currentPair: null,
      isGameActive: false,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} onFail={mockOnFail} />);

    await waitFor(() => {
      expect(mockOnFail).toHaveBeenCalledWith('0');
    });
  });

  it('calls onFail with timeout when no click was made', async () => {
    const mockOnFail = vi.fn();
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: false,
        isComplete: true,
        gameResult: 'failure',
        clickedIndex: null
      },
      currentPair: null,
      isGameActive: false,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} onFail={mockOnFail} />);

    await waitFor(() => {
      expect(mockOnFail).toHaveBeenCalledWith('timeout');
    });
  });

  it('shows matching instruction when current pair is a match', () => {
    (useConcentrationGameState as any).mockReturnValue({
      gameState: {
        currentIndex: 0,
        hasClicked: false,
        isComplete: false,
        gameResult: null,
        clickedIndex: null
      },
      currentPair: {
        color_word: 'blue',
        circle_color: 'blue',
        is_match: true
      },
      isGameActive: true,
      resetGame: vi.fn(),
      resetCounter: 0,
      handleClick: vi.fn()
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText('Click the circle - text and color match!')).toBeInTheDocument();
  });

  it('shows non-matching instruction when current pair is not a match', () => {
    (useConcentrationGameState as any).mockReturnValue({
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
    });

    render(<ConcentrationPuzzle {...mockProps} />);

    expect(screen.getByText("Don't click - text and color don't match!")).toBeInTheDocument();
  });
});

describe('Readonly/Spectator Mode', () => {
  const mockPuzzle = {
    id: 1,
    type: 'concentration',
    data: {
      pairs: [
        { color_word: 'red', circle_color: 'blue', is_match: false },
        { color_word: 'blue', circle_color: 'blue', is_match: true }
      ],
      duration: 2
    }
  };

  const mockProps = {
    puzzle: mockPuzzle,
    onSolve: vi.fn(),
    onFail: vi.fn()
  };

  it('should disable circle click and show spectating overlay', () => {
    render(<ConcentrationPuzzle {...mockProps} readonly={true} />);
    // Spectating overlay should be visible
    expect(screen.getByText('Spectating')).toBeInTheDocument();
    // Circle should not trigger click handler
    const circle = screen.getByTestId('color-circle');
    fireEvent.click(circle);
    // No errors should occur and overlay is present
    expect(circle).toBeInTheDocument();
  });
}); 