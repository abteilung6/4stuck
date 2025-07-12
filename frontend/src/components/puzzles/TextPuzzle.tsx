import React from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import Button from '../design-system/Button';
import StatusMessage from '../design-system/StatusMessage';
import { QuestionText } from '../design-system/Typography';

export interface TextPuzzleProps {
  puzzle: any;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  loading: boolean;
  feedback: string;
}

export const TextPuzzle: React.FC<TextPuzzleProps> = ({
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

  return (
    <Card>
      <SectionTitle level={2}>Text Puzzle</SectionTitle>
      <QuestionText><strong>Question:</strong> {puzzle.data?.question || 'No question available'}</QuestionText>
      <form onSubmit={handleSubmit} className="answer-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer..."
          disabled={loading}
          className="ds-input"
          aria-label="Answer input"
        />
        <Button type="submit" disabled={loading || !answer.trim()} variant="primary">
          {loading ? 'Submitting...' : 'Submit Answer'}
        </Button>
      </form>
      {feedback && (
        <StatusMessage type={feedback.includes('Correct') ? 'success' : 'error'}>{feedback}</StatusMessage>
      )}
    </Card>
  );
}; 