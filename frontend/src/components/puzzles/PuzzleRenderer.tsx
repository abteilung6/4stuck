import React from 'react';
import { TextPuzzle } from './TextPuzzle';
import { MultipleChoicePuzzle } from './MultipleChoicePuzzle';

export interface PuzzleRendererProps {
  puzzle: any;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  loading: boolean;
  feedback: string;
}

export const PuzzleRenderer: React.FC<PuzzleRendererProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  feedback,
}) => {
  if (!puzzle) return <p>No puzzle available.</p>;

  switch (puzzle.type) {
    case 'multiple_choice':
      return (
        <MultipleChoicePuzzle
          puzzle={puzzle}
          answer={answer}
          setAnswer={setAnswer}
          submitAnswer={submitAnswer}
          loading={loading}
          feedback={feedback}
        />
      );
    case 'text':
    default:
      return (
        <TextPuzzle
          puzzle={puzzle}
          answer={answer}
          setAnswer={setAnswer}
          submitAnswer={submitAnswer}
          loading={loading}
          feedback={feedback}
        />
      );
  }
}; 