import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryPuzzle } from '../MemoryPuzzle';
import * as memoryPuzzleUtils from '../../../utils/memoryPuzzleUtils';
import { useMemoryGameState } from '../../../hooks/useMemoryGameState';

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

describe('MemoryPuzzle', () => {
  const defaultProps = {
    puzzle: {
      id: 1,
      data: {
        mapping: { '1': 'red', '2': 'blue', '3': 'green' },
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
    mapping: { '1': 'red', '2': 'blue', '3': 'green' },
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
    ]);
    mockMemoryPuzzleUtils.generateMappingLabel.mockImplementation(
      (number: string, color: string) => `Number ${number} is ${color}`
    );
    mockMemoryPuzzleUtils.generateChoiceLabel.mockImplementation(
      (choice: string) => choice
    );
  });

  describe('Mapping Phase', () => {
    it('should display mapping phase when showMapping is true', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');
      expect(screen.getByLabelText('Number 1 is red')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 2 is blue')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 3 is green')).toBeInTheDocument();
    });

    it('should display mapping items with correct labels', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 3,
        isComplete: false,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('section-title-3')).toHaveTextContent('Color-Number Mapping');
      expect(screen.getByLabelText('Number 1 is red')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 2 is blue')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 3 is green')).toBeInTheDocument();
    });

    it('should call utility functions with correct parameters', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(mockMemoryPuzzleUtils.extractMemoryPuzzleData).toHaveBeenCalledWith(defaultProps.puzzle);
      expect(mockMemoryPuzzleUtils.formatMappingForDisplay).toHaveBeenCalledWith(mockPuzzleData.mapping);
    });
  });

  describe('Question Phase', () => {
    it('should display question phase when showMapping is false', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('question-text')).toHaveTextContent('What color is associated with the number 2?');
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should display all choice options', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByDisplayValue('red')).toBeInTheDocument();
      expect(screen.getByDisplayValue('blue')).toBeInTheDocument();
      expect(screen.getByDisplayValue('green')).toBeInTheDocument();
      expect(screen.getByDisplayValue('yellow')).toBeInTheDocument();
    });

    it('should handle answer selection', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      const blueRadio = screen.getByDisplayValue('blue');
      fireEvent.click(blueRadio);

      expect(defaultProps.setAnswer).toHaveBeenCalledWith('blue');
    });

    it('should handle form submission', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(defaultProps.submitAnswer).toHaveBeenCalled();
    });

    it('should disable submit button when no answer is selected', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="" />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when answer is selected', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable form when loading', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} loading={true} answer="blue" />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Submitting...');

      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('should show correct answer as selected', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const blueRadio = screen.getByDisplayValue('blue') as HTMLInputElement;
      expect(blueRadio.checked).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should display error message for invalid puzzle data', () => {
      mockMemoryPuzzleUtils.extractMemoryPuzzleData.mockReturnValue(null);

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByTestId('status-message')).toHaveTextContent('Invalid puzzle data');
      expect(screen.getByTestId('status-message')).toHaveAttribute('data-type', 'error');
    });

    it('should display feedback message when provided', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} feedback="Correct answer!" />);

      const feedbackMessage = screen.getByTestId('status-message');
      expect(feedbackMessage).toHaveTextContent('Correct answer!');
      expect(feedbackMessage).toHaveAttribute('data-type', 'success');
    });

    it('should display error feedback with correct type', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} feedback="Wrong answer!" />);

      const feedbackMessage = screen.getByTestId('status-message');
      expect(feedbackMessage).toHaveTextContent('Wrong answer!');
      expect(feedbackMessage).toHaveAttribute('data-type', 'error');
    });
  });

  describe('Hook Integration', () => {
    it('should call useMemoryGameState with correct parameters', () => {
      render(<MemoryPuzzle {...defaultProps} />);

      expect(mockUseMemoryGameState).toHaveBeenCalledWith({
        puzzleId: 1,
        mappingDuration: 5,
      });
    });

    it('should handle puzzle id changes', () => {
      const { rerender } = render(<MemoryPuzzle {...defaultProps} />);

      rerender(<MemoryPuzzle {...defaultProps} puzzle={{ ...defaultProps.puzzle, id: 2 }} />);

      expect(mockUseMemoryGameState).toHaveBeenCalledWith({
        puzzleId: 2,
        mappingDuration: 5,
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for mapping items', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: true,
        timeLeft: 5,
        isComplete: false,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByLabelText('Number 1 is red')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 2 is blue')).toBeInTheDocument();
      expect(screen.getByLabelText('Number 3 is green')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for choice options', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByDisplayValue('red')).toBeInTheDocument();
      expect(screen.getByDisplayValue('blue')).toBeInTheDocument();
      expect(screen.getByDisplayValue('green')).toBeInTheDocument();
      expect(screen.getByDisplayValue('yellow')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for radio buttons', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} answer="blue" />);

      const blueRadio = screen.getByDisplayValue('blue') as HTMLInputElement;
      expect(blueRadio).toHaveAttribute('aria-checked', 'true');
    });

    it('should have proper role for choice group', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Choices');
    });
  });

  describe('Event Handling', () => {
    it('should prevent default form submission', () => {
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

    it('should handle radio button change events', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });

      render(<MemoryPuzzle {...defaultProps} />);

      const greenRadio = screen.getByDisplayValue('green');
      fireEvent.click(greenRadio);

      expect(defaultProps.setAnswer).toHaveBeenCalledWith('green');
    });
  });

  describe('Readonly/Spectator Mode', () => {
    it('should disable all inputs and show spectating overlay', () => {
      mockUseMemoryGameState.mockReturnValue({
        showMapping: false,
        timeLeft: 0,
        isComplete: true,
      });
      render(<MemoryPuzzle {...defaultProps} readonly={true} answer="blue" />);
      // All radio buttons should be disabled
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });
      // Submit button should be disabled
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      // Spectating overlay should be visible
      expect(screen.getByText('Spectating')).toBeInTheDocument();
    });
  });

  describe('Component Unmount', () => {
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
  });
}); 