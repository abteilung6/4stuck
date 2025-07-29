import React from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import Button from '../design-system/Button';
import StatusMessage from '../design-system/StatusMessage';
import { QuestionText, ChoiceText } from '../design-system/Typography';
import { useMemoryGameState } from '../../hooks/useMemoryGameState';
import {
  extractMemoryPuzzleData,
  formatMappingForDisplay,
  generateMappingLabel,
  generateChoiceLabel,
  type MemoryPuzzleData,
} from '../../utils/memoryPuzzleUtils';

export interface MemoryPuzzleProps {
  puzzle: any;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  loading: boolean;
  feedback: string;
  readonly?: boolean;
}

export const MemoryPuzzle: React.FC<MemoryPuzzleProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  feedback,
  readonly = false,
}) => {
  const { showMapping, timeLeft, isComplete } = useMemoryGameState({
    puzzleId: puzzle?.id,
    mappingDuration: 5,
  });

  const puzzleData = extractMemoryPuzzleData(puzzle);

  if (!puzzleData) {
    return (
      <Card>
        <SectionTitle level={2}>Memory Puzzle</SectionTitle>
        <StatusMessage type="error">Invalid puzzle data.</StatusMessage>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  if (showMapping) {
    return (
      <Card>
        {readonly && <div className="spectator-overlay">Spectating</div>}
        <div className="memory-mapping">
          <SectionTitle level={3} className="sr-only">
            Color-Number Mapping
          </SectionTitle>
          <div className="mapping-grid">
            {formatMappingForDisplay(puzzleData.mapping).map(({ number, color }) => (
              <div
                key={number}
                className="mapping-item"
                aria-label={generateMappingLabel(number, color)}
              >
                <span className="number">{number}</span>
                <span className="color">{color}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {readonly && <div className="spectator-overlay">Spectating</div>}
      <form onSubmit={handleSubmit} className="memory-form">
      <QuestionText>
        <strong>Question:</strong> What color is associated with the number{' '}
        {puzzleData.question_number}?
      </QuestionText>
        <div className="choices" role="radiogroup" aria-label="Choices">
          {puzzleData.choices.map((choice: string) => (
            <label
              key={choice}
              className="choice-option"
              aria-label={generateChoiceLabel(choice)}
            >
              <input
                type="radio"
                name="answer"
                value={choice}
                checked={answer === choice}
                onChange={readonly ? undefined : handleAnswerChange}
                disabled={loading || readonly}
                aria-checked={answer === choice}
              />
              <ChoiceText>{choice}</ChoiceText>
            </label>
          ))}
        </div>
        <Button type="submit" disabled={loading || !answer || readonly} variant="primary">
          {loading ? 'Submitting...' : 'Submit Answer'}
        </Button>
      </form>
      {feedback && (
        <StatusMessage
          type={feedback.includes('Correct') ? 'success' : 'error'}
        >
          {feedback}
        </StatusMessage>
      )}
    </Card>
  );
};
