import React from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import Button from '../design-system/Button';
import StatusMessage from '../design-system/StatusMessage';
import { QuestionText, ChoiceText } from '../design-system/Typography';

export interface MultipleChoicePuzzleProps {
  puzzle: any;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  loading: boolean;
  feedback: string;
}

export const MultipleChoicePuzzle: React.FC<MultipleChoicePuzzleProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  feedback,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };

  const choices: string[] = puzzle.data?.choices || [];

  return (
    <Card>
      <SectionTitle level={2}>Multiple Choice</SectionTitle>
      <QuestionText><strong>Question:</strong> {puzzle.data?.question || 'No question available'}</QuestionText>
      <form onSubmit={handleSubmit} className="answer-form">
        <div role="radiogroup" aria-label="Choices" className="choices-container">
          {choices.map((choice, idx) => (
            <label key={idx} className="choice-label" aria-label={choice}>
              <input
                type="radio"
                name="multiple-choice-answer"
                value={choice}
                checked={answer === choice}
                onChange={() => setAnswer(choice)}
                disabled={loading}
                aria-checked={answer === choice}
              />
              <ChoiceText>{choice}</ChoiceText>
            </label>
          ))}
        </div>
        <Button type="submit" disabled={loading || !answer} variant="primary">
          {loading ? 'Submitting...' : 'Submit Answer'}
        </Button>
      </form>
      {feedback && (
        <StatusMessage type={feedback.includes('Correct') ? 'success' : 'error'}>{feedback}</StatusMessage>
      )}
    </Card>
  );
}; 