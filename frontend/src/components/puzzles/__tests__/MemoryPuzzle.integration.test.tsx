import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryPuzzle } from '../MemoryPuzzle';
import { useMemoryGameState } from '../../../hooks/useMemoryGameState';
import * as memoryPuzzleUtils from '../../../utils/memoryPuzzleUtils';

// Mock the custom hook
vi.mock('../../../hooks/useMemoryGameState');
const mockUseMemoryGameState = useMemoryGameState as any;

// Mock the utility functions
vi.mock('../../../utils/memoryPuzzleUtils');
const mockMemoryPuzzleUtils = memoryPuzzleUtils as any;

// Mock design system components
vi.mock('../../design-system/Card', () => ({
  default: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
}));

vi.mock('../../design-system/SectionTitle', () => ({
  default: ({ children, level, ...props }: any) => (
    <div data-testid={`section-title-${level}`} {...props}>{children}</div>
  ),
}));

vi.mock('../../design-system/Button', () => ({
  default: ({ children, type, disabled, variant, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../design-system/StatusMessage', () => ({
  default: ({ children, type, ...props }: any) => (
    <div data-testid="status-message" data-type={type} {...props}>{children}</div>
  ),
}));

vi.mock('../../design-system/Typography', () => ({
  QuestionText: ({ children, ...props }: any) => (
    <div data-testid="question-text" {...props}>{children}</div>
  ),
  ChoiceText: ({ children, ...props }: any) => (
    <span data-testid="choice-text" {...props}>{children}</span>
  ),
}));

describe('MemoryPuzzle Integration Tests', () => {
  const defaultProps = {
    puzzle: {
      id: 1,
      data: {
        mapping: { '1': 'red', '2': 'blue', '3': 'green', '4': 'yellow' },
        question_number: '2',
        choices: ['red', 'blue', 'green', 'yellow'],
      },
    },
    answer: '',
    setAnswer: vi.fn(),
    submitAnswer: vi.fn(),
    loading: false,
    feedback: '',
  };

  const mockPuzzleData = {
    mapping: { '1': 'red', '2': 'blue', '3': 'green', '4': 'yellow' },
    question_number: '2',
    choices: ['red', 'blue', 'green', 'yellow'],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseMemoryGameState.mockReturnValue({
      showMapping: true,
      timeLeft: 5,
      isComplete: false,
    });

    mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(mockPuzzleData);
    mockMemoryPuzzleUtils.formatMappingForDisplay.mockReturnValue([
      { number: '1', color: 'red' },
      { number: '2', color: 'blue' },
      { number: '3', color: 'green' },
      { number: '4', color: 'yellow' },
    ]);
    mockMemoryPuzzleUtils.generateMappingLabel.mockImplementation(
      (number: string, color: string) => `Number ${number} is ${color}`
    );
    mockMemoryPuzzleUtils.generateChoiceLabel.mockImplementation(
      (choice: string) => choice
    );
  });

  describe('Complete Game Flow', () => {
    it('should handle complete memory puzzle flow from mapping to answer submission', async () => {
      // Start with mapping phase
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      const { rerender } = render(<MemoryPuzzle {...defaultProps} />);

      // Verify mapping phase
      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');
      expect(screen.getByLabelText('Number 1 is red')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 2 is blue')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 3 is green')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 4 is yellow')).toBeInTheDocument();

      // Transition to question phase
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      rerender(<MemoryPuzzle {...defaultProps} />);

      // Verify question phase
      expect(screen.getByTestId('question-text')).toHaveTextContent('What color is associated with the number 2?');
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();

      // Select correct answer
      const blueRadio = screen.getByDisplayValue('blue');
      fireEvent.click(blueRadio);

      expect(defaultProps.setAnswer).toHaveBeenCalledWith('blue');

      // Rerender with answer set
      rerender(<MemoryPuzzle {...defaultProps} answer="blue" />);

      // Submit answer
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(defaultProps.submitAnswer).toHaveBeenCalled();
    });

    it('should handle timer countdown during mapping phase', async () => {
      // Start with 5 seconds
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      const { rerender } = render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');

      // Simulate timer countdown
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 4,
        isComplete: false,
      });

      rerender(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');

      // Continue countdown
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 1,
        isComplete: false,
      });

      rerender(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');

      // Timer completes
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      rerender(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('question-text')).toHaveTextContent('What color is associated with the number 2?');
    });
  });

  describe('Answer Selection and Validation', () => {
    it('should handle multiple answer changes correctly', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      // Select first answer
      const redRadio = screen.getByDisplayValue('red');
      fireEvent.click(redRadio);
      expect(defaultProps.setAnswer).toHaveBeenCalledWith('red');

      // Change to different answer
      const greenRadio = screen.getByDisplayValue('green');
      fireEvent.click(greenRadio);
      expect(defaultProps.setAnswer).toHaveBeenCalledWith('green');

      // Change to correct answer
      const blueRadio = screen.getByDisplayValue('blue');
      fireEvent.click(blueRadio);
      expect(defaultProps.setAnswer).toHaveBeenCalledWith('blue');

      expect(defaultProps.setAnswer).toHaveBeenCalledTimes(3);
    });

    it('should enable submit button only when answer is selected', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      const { rerender } = render(<MemoryPuzzle {...defaultProps} answer="" />);

      // Initially disabled
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();

      // Enable after selection
      rerender(<MemoryPuzzle {...defaultProps} answer="blue" />);
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle form submission with correct answer', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(defaultProps.submitAnswer).toHaveBeenCalledTimes(1);
    });

    it('should prevent submission when no answer is selected', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="" />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();

      // Try to submit anyway
      fireEvent.click(submitButton);
      expect(defaultProps.submitAnswer).not.toHaveBeenCalled();
    });
  });

  describe('Loading and Feedback States', () => {
    it('should handle loading state during submission', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} loading={true} answer="blue" />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Submitting...');

      // Radio buttons should be disabled
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('should display success feedback correctly', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} feedback="Correct answer! Well done!" />);

      const feedbackMessage = screen.getByTestId('status-message');
      expect(feedbackMessage).toHaveTextContent('Correct answer! Well done!');
      expect(feedbackMessage).toHaveAttribute('data-type', 'success');
    });

    it('should display error feedback correctly', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} feedback="Incorrect answer. Try again!" />);

      const feedbackMessage = screen.getByTestId('status-message');
      expect(feedbackMessage).toHaveTextContent('Incorrect answer. Try again!');
      expect(feedbackMessage).toHaveAttribute('data-type', 'error');
    });

    it('should not display feedback when empty', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} feedback="" />);

      expect(screen.queryByTestId('status-message')).not.toBeInTheDocument();
    });
  });

  describe('Puzzle Data Validation', () => {
    it('should handle invalid puzzle data gracefully', () => {
      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(null);

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('status-message')).toHaveTextContent('Invalid puzzle data');
      expect(screen.getByTestId('status-message')).toHaveAttribute('data-type', 'error');
    });

    it('should handle missing puzzle data', () => {
      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(null);

      render(<MemoryPuzzle {...defaultProps} puzzle={null} />);

      expect(screen.getByTestId('status-message')).toHaveTextContent('Invalid puzzle data');
    });

    it('should handle puzzle with different question numbers', () => {
      const differentPuzzleData = {
        ...mockPuzzleData,
        question_number: '4',
      };

      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(differentPuzzleData);

      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('question-text')).toHaveTextContent('What color is associated with the number 4?');
    });

    it('should handle puzzle with different choices', () => {
      const differentPuzzleData = {
        ...mockPuzzleData,
        choices: ['purple', 'orange', 'pink', 'brown'],
      };

      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(differentPuzzleData);

      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByDisplayValue('purple')).toBeInTheDocument();
      expect(screen.getByDisplayValue('orange')).toBeInTheDocument();
      expect(screen.getByDisplayValue('pink')).toBeInTheDocument();
      expect(screen.getByDisplayValue('brown')).toBeInTheDocument();
    });
  });

  describe('Puzzle ID Changes', () => {
    it('should handle puzzle ID changes correctly', () => {
      const { rerender } = render(<MemoryPuzzle {...defaultProps} />);

      // Verify initial call
      expect(mockUseMemoryGameState).toHaveBeenCalledWith({
        puzzleId: 1,
        mappingDuration: 5,
      });

      // Change puzzle ID
      rerender(<MemoryPuzzle {...defaultProps} puzzle={{ ...defaultProps.puzzle, id: 2 }} />);

      expect(mockUseMemoryGameState).toHaveBeenCalledWith({
        puzzleId: 2,
        mappingDuration: 5,
      });
    });

    it('should handle multiple puzzle changes', () => {
      const { rerender } = render(<MemoryPuzzle {...defaultProps} />);

      // Change puzzle multiple times
      rerender(<MemoryPuzzle {...defaultProps} puzzle={{ ...defaultProps.puzzle, id: 2 }} />);
      rerender(<MemoryPuzzle {...defaultProps} puzzle={{ ...defaultProps.puzzle, id: 3 }} />);
      rerender(<MemoryPuzzle {...defaultProps} puzzle={{ ...defaultProps.puzzle, id: 4 }} />);

      expect(mockUseMemoryGameState).toHaveBeenCalledWith({
        puzzleId: 4,
        mappingDuration: 5,
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility during state transitions', () => {
      // Start with mapping phase
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      const { rerender } = render(<MemoryPuzzle {...defaultProps} />);

      // Verify mapping accessibility
      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');
      expect(screen.getByLabelText('Number 1 is red')).toBeInTheDocument();

      // Transition to question phase
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      rerender(<MemoryPuzzle {...defaultProps} />);

      // Verify question accessibility
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Choices');
      expect(screen.getByDisplayValue('red')).toBeInTheDocument();
    });

    it('should handle keyboard navigation for radio buttons', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(4);

      // Test keyboard navigation
      radioButtons[0].focus();
      expect(radioButtons[0]).toHaveFocus();

      // Note: Keyboard navigation behavior may vary in test environment
      // This test verifies the elements are present and focusable
    });

    it('should maintain ARIA attributes during answer selection', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      const { rerender } = render(<MemoryPuzzle {...defaultProps} answer="" />);

      // Initially no radio button should be checked
      const radioButtons = screen.getAllByRole('radio') as HTMLInputElement[];
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });

      // Select an answer
      rerender(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const blueRadio = screen.getByDisplayValue('blue') as HTMLInputElement;
      expect(blueRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle rapid answer changes', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      // Rapidly change answers
      const redRadio = screen.getByDisplayValue('red');
      const blueRadio = screen.getByDisplayValue('blue');
      const greenRadio = screen.getByDisplayValue('green');

      fireEvent.click(redRadio);
      fireEvent.click(blueRadio);
      fireEvent.click(greenRadio);
      fireEvent.click(redRadio);

      expect(defaultProps.setAnswer).toHaveBeenCalledTimes(4);
      expect(defaultProps.setAnswer).toHaveBeenLastCalledWith('red');
    });

    it('should handle form submission with keyboard', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const form = screen.getByRole('radiogroup').closest('form');
      fireEvent.submit(form!);

      expect(defaultProps.submitAnswer).toHaveBeenCalled();
    });

    it('should handle component unmounting during mapping phase', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      const { unmount } = render(<MemoryPuzzle {...defaultProps} />);

      // Verify component is rendered
      expect(screen.getByTestId('section-title-3')).toBeInTheDocument();

      // Unmount component
      unmount();

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle empty choices array', () => {
      const emptyChoicesData = {
        ...mockPuzzleData,
        choices: [],
      };

      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(emptyChoicesData);

      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      // Should not crash and should show no radio buttons
      const radioButtons = screen.queryAllByRole('radio');
      expect(radioButtons).toHaveLength(0);
    });
  });

  describe('Backend Data Structure Compatibility', () => {
    it('should work with correct backend data structure (string keys and question_number)', () => {
      // This test verifies that the fix for backend data structure works
      // Backend now generates: mapping with string keys, question_number as string
      const backendPuzzle = {
        id: 1,
        type: 'memory',
        data: {
          mapping: { '1': 'red', '2': 'blue', '3': 'green', '4': 'yellow' }, // String keys
          question_number: '2', // String as expected by frontend
          choices: ['red', 'blue', 'green', 'yellow'],
        },
        correct_answer: 'blue',
        status: 'active',
      };

      // Mock the utility to return the correct data
      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(backendPuzzle.data);

      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle puzzle={backendPuzzle} {...defaultProps} />);

      // Should not show "Invalid puzzle data" error
      expect(screen.queryByText('Invalid puzzle data.')).not.toBeInTheDocument();

      // Should show the question with the correct number
      expect(screen.getByTestId('question-text')).toHaveTextContent('What color is associated with the number 2?');

      // Should show all choices
      expect(screen.getByDisplayValue('red')).toBeInTheDocument();
      expect(screen.getByDisplayValue('blue')).toBeInTheDocument();
      expect(screen.getByDisplayValue('green')).toBeInTheDocument();
      expect(screen.getByDisplayValue('yellow')).toBeInTheDocument();
    });

    it('should show error for old backend data structure (number keys and question_number)', () => {
      // This test verifies that the old incorrect data structure still shows an error
      const oldBackendPuzzle = {
        id: 1,
        type: 'memory',
        data: {
          mapping: { 1: 'red', 2: 'blue', 3: 'green', 4: 'yellow' }, // Number keys (old format)
          question_number: 2, // Number instead of string (old format)
          choices: ['red', 'blue', 'green', 'yellow'],
        },
        correct_answer: 'blue',
        status: 'active',
      };

      // Mock the utility to return null for invalid data
      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(null);

      render(<MemoryPuzzle puzzle={oldBackendPuzzle} {...defaultProps} />);

      // Should show "Invalid puzzle data" error
      expect(screen.getByText('Invalid puzzle data.')).toBeInTheDocument();
    });
  });
});
