import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MultitaskingPuzzle from '../MultitaskingPuzzle';
import { useMultitaskingGameState } from '../../../hooks/useMultitaskingGameState';
import * as multitaskingPuzzleUtils from '../../../utils/multitaskingPuzzleUtils';

// Mock the custom hook
vi.mock('../../../hooks/useMultitaskingGameState');
const mockUseMultitaskingGameState = useMultitaskingGameState as any;

// Mock the utility functions
vi.mock('../../../utils/multitaskingPuzzleUtils');
const mockMultitaskingPuzzleUtils = multitaskingPuzzleUtils as any;

describe('MultitaskingPuzzle Integration', () => {
  const mockSubmitAnswerWithAnswer = vi.fn();
  const mockSetAnswer = vi.fn();
  const mockSubmitAnswer = vi.fn();

  const validPuzzleData = {
    rows: 3,
    digitsPerRow: 9,
    timeLimit: 10,
    sixPositions: [2, 5, 7] // 6s at positions 2, 5, 7 in rows 0, 1, 2
  };

  const defaultProps = {
    puzzle: {
      type: 'multitasking',
      data: validPuzzleData
    },
    answer: '',
    setAnswer: mockSetAnswer,
    submitAnswer: mockSubmitAnswer,
    submitAnswerWithAnswer: mockSubmitAnswerWithAnswer,
    loading: false,
    feedback: ''
  };

  const mockGrid = [
    ['9', '9', '6', '9', '9', '9', '9', '9', '9'],
    ['9', '9', '9', '9', '9', '6', '9', '9', '9'],
    ['9', '9', '9', '9', '9', '9', '9', '6', '9']
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: validPuzzleData,
      grid: mockGrid,
      foundPositions: [],
      timeRemaining: 10,
      isComplete: false,
      isTimeUp: false,
      progress: 0,
      handleDigitClick: vi.fn(),
      resetGame: vi.fn()
    });

    mockMultitaskingPuzzleUtils.extractMultitaskingPuzzleData.mockReturnValue(validPuzzleData);
    mockMultitaskingPuzzleUtils.formatTime.mockReturnValue('0:10');
  });

  it('should render puzzle with correct structure', () => {
    render(<MultitaskingPuzzle {...defaultProps} />);

    // Check timer
    expect(screen.getByText('Time: 0:10')).toBeInTheDocument();

    // Check grid structure
    const gridDigits = screen.getAllByRole('button', { name: /Row \d+, Column \d+: [69]/ });
    expect(gridDigits).toHaveLength(27); // 3 rows * 9 columns

    // Check progress dots - there should be 3 dots for 3 rows
    const progressDots = document.querySelectorAll('.progress-dot');
    expect(progressDots).toHaveLength(3);
  });

  it('should handle valid puzzle data correctly', () => {
    render(<MultitaskingPuzzle {...defaultProps} />);

    // Should not show error message
    expect(screen.queryByText('❌ Invalid puzzle data')).not.toBeInTheDocument();

    // Should show the grid
    // No title to check
    // Just check grid exists
    const gridDigits = screen.getAllByRole('button', { name: /Row \d+, Column \d+: [69]/ });
    expect(gridDigits.length).toBeGreaterThan(0);
  });

  it('should show error for invalid puzzle data', () => {
    mockMultitaskingPuzzleUtils.extractMultitaskingPuzzleData.mockReturnValue(null);

    const invalidProps = {
      ...defaultProps,
      puzzle: {
        type: 'multitasking',
        data: null
      }
    };

    render(<MultitaskingPuzzle {...invalidProps} />);

    expect(screen.getByText('❌ Invalid puzzle data')).toBeInTheDocument();
  });

  it('should handle digit clicks and track progress', () => {
    render(<MultitaskingPuzzle {...defaultProps} />);

    // Click the first 6
    const firstSix = screen.getByRole('button', { name: /Row 1, Column 3: 6/ });
    fireEvent.click(firstSix);

    // Check progress dots update
    const progressDots = document.querySelectorAll('.progress-dot');
    expect(progressDots[1]).not.toHaveClass('found');
    expect(progressDots[2]).not.toHaveClass('found');
  });

  it('should allow replacing incorrect selections', async () => {
    const mockHandleDigitClick = vi.fn();
    let currentFoundPositions: number[] = [];

    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: validPuzzleData,
      grid: mockGrid,
      get foundPositions() { return currentFoundPositions; },
      timeRemaining: 10,
      isComplete: false,
      isTimeUp: false,
      progress: 0,
      handleDigitClick: mockHandleDigitClick,
      resetGame: vi.fn()
    });

    const { rerender } = render(<MultitaskingPuzzle {...defaultProps} />);

    // Click wrong position in first row (should be handled by the hook)
    const wrongPosition = screen.getByRole('button', { name: /Row 1, Column 1: 9/ });
    fireEvent.click(wrongPosition);

    // The hook should handle this, but the button should be disabled
    expect(wrongPosition).toBeDisabled();

    // Click correct position in first row
    const correctPosition = screen.getByRole('button', { name: /Row 1, Column 3: 6/ });
    fireEvent.click(correctPosition);

    expect(mockHandleDigitClick).toHaveBeenCalledWith(0, 2);
  });

  it('should handle time up scenario', async () => {
    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: validPuzzleData,
      grid: mockGrid,
      foundPositions: [2],
      timeRemaining: 0,
      isComplete: false,
      isTimeUp: true,
      progress: 33,
      handleDigitClick: vi.fn(),
      resetGame: vi.fn()
    });

    render(<MultitaskingPuzzle {...defaultProps} />);

    expect(screen.getByText('⏰ Time\'s up!')).toBeInTheDocument();
  });

  it('should not allow clicks when game is complete', async () => {
    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: validPuzzleData,
      grid: mockGrid,
      foundPositions: [2, 5, 7],
      timeRemaining: 5,
      isComplete: true,
      isTimeUp: false,
      progress: 100,
      handleDigitClick: vi.fn(),
      resetGame: vi.fn()
    });

    render(<MultitaskingPuzzle {...defaultProps} />);

    expect(screen.getByText('✅ All 6s found!')).toBeInTheDocument();

    // Try to click on a digit after completion
    const digitButton = screen.getByRole('button', { name: /Row 1, Column 1: 9/ });
    expect(digitButton).toBeDisabled();
  });

  it('should not allow clicks when loading', () => {
    const loadingProps = {
      ...defaultProps,
      loading: true
    };

    render(<MultitaskingPuzzle {...loadingProps} />);

    // Try to click on a digit
    const digitButton = screen.getByRole('button', { name: /Row 1, Column 3: 6/ });
    expect(digitButton).toBeDisabled();
  });

  it('should display feedback correctly', () => {
    const feedbackProps = {
      ...defaultProps,
      feedback: 'Correct!'
    };

    // Mock the hook to return a completed game state so feedback is shown
    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: validPuzzleData,
      grid: mockGrid,
      foundPositions: [2, 5, 7],
      timeRemaining: 5,
      isComplete: true,
      isTimeUp: false,
      progress: 100,
      handleDigitClick: vi.fn(),
      resetGame: vi.fn()
    });

    render(<MultitaskingPuzzle {...feedbackProps} />);

    const feedbackElement = screen.getByText('Correct!');
    expect(feedbackElement).toBeInTheDocument();
    expect(feedbackElement).toHaveClass('feedback');
  });

  it('should display error feedback correctly', () => {
    const feedbackProps = {
      ...defaultProps,
      feedback: 'Incorrect answer'
    };

    // Mock the hook to return a completed game state so feedback is shown
    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: validPuzzleData,
      grid: mockGrid,
      foundPositions: [2, 5, 7],
      timeRemaining: 5,
      isComplete: true,
      isTimeUp: false,
      progress: 100,
      handleDigitClick: vi.fn(),
      resetGame: vi.fn()
    });

    render(<MultitaskingPuzzle {...feedbackProps} />);

    const feedbackElement = screen.getByText('Incorrect answer');
    expect(feedbackElement).toBeInTheDocument();
    expect(feedbackElement).toHaveClass('feedback');
  });

  it('should generate correct grid with 6s in specified positions', () => {
    render(<MultitaskingPuzzle {...defaultProps} />);

    // Check that 6s are in the correct positions
    expect(screen.getByRole('button', { name: /Row 1, Column 3: 6/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 2, Column 6: 6/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 3, Column 8: 6/ })).toBeInTheDocument();

    // Check that other positions are 9s
    expect(screen.getByRole('button', { name: /Row 1, Column 1: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 1, Column 2: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 1, Column 4: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 2, Column 1: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 2, Column 5: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 2, Column 7: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 3, Column 1: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 3, Column 7: 9/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Row 3, Column 9: 9/ })).toBeInTheDocument();
  });

  it('should handle different puzzle configurations', () => {
    const customPuzzleData = {
      rows: 2,
      digitsPerRow: 5,
      timeLimit: 15,
      sixPositions: [1, 3] // 6s at positions 1, 3 in rows 0, 1
    };

    const customGrid = [
      ['9', '6', '9', '9', '9'],
      ['9', '9', '9', '6', '9']
    ];

    mockUseMultitaskingGameState.mockReturnValue({
      puzzleData: customPuzzleData,
      grid: customGrid,
      foundPositions: [],
      timeRemaining: 15,
      isComplete: false,
      isTimeUp: false,
      progress: 0,
      handleDigitClick: vi.fn(),
      resetGame: vi.fn()
    });

    mockMultitaskingPuzzleUtils.extractMultitaskingPuzzleData.mockReturnValue(customPuzzleData);
    mockMultitaskingPuzzleUtils.formatTime.mockReturnValue('0:15');

    const customProps = {
      ...defaultProps,
      puzzle: {
        type: 'multitasking',
        data: customPuzzleData
      }
    };

    render(<MultitaskingPuzzle {...customProps} />);

    // Check timer
    expect(screen.getByText('Time: 0:15')).toBeInTheDocument();

    // Check grid structure
    const gridDigits = screen.getAllByRole('button', { name: /Row \d+, Column \d+: [69]/ });
    expect(gridDigits).toHaveLength(10); // 2 rows * 5 columns

    // Check progress dots - there should be 2 dots for 2 rows
    const progressDots = document.querySelectorAll('.progress-dot');
    expect(progressDots).toHaveLength(2);
  });
});

describe('Readonly/Spectator Mode', () => {
  const mockSubmitAnswerWithAnswer = vi.fn();
  const mockSetAnswer = vi.fn();
  const mockSubmitAnswer = vi.fn();

  const validPuzzleData = {
    rows: 3,
    digitsPerRow: 9,
    timeLimit: 10,
    sixPositions: [2, 5, 7] // 6s at positions 2, 5, 7 in rows 0, 1, 2
  };

  const defaultProps = {
    puzzle: {
      type: 'multitasking',
      data: validPuzzleData
    },
    answer: '',
    setAnswer: mockSetAnswer,
    submitAnswer: mockSubmitAnswer,
    submitAnswerWithAnswer: mockSubmitAnswerWithAnswer,
    loading: false,
    feedback: ''
  };

  it('should disable all digit buttons and show spectating overlay', () => {
    render(<MultitaskingPuzzle {...defaultProps} readonly={true} />);
    // All digit buttons should be disabled
    const digitButtons = screen.getAllByRole('button', { name: /Row \d+, Column \d+: [69]/ });
    digitButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
    // Spectating overlay should be visible
    expect(screen.getByText('Spectating')).toBeInTheDocument();
  });
});
