import React from 'react';
import { TextPuzzle } from './TextPuzzle';
import { MultipleChoicePuzzle } from './MultipleChoicePuzzle';
import { MemoryPuzzle } from './MemoryPuzzle';
import { SpatialPuzzle } from './SpatialPuzzle';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import { BodyText } from '../design-system/Typography';

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
  if (!puzzle) return (
    <Card>
      <SectionTitle level={2}>No puzzle available</SectionTitle>
      <BodyText color="secondary">Please wait for a puzzle to be generated.</BodyText>
    </Card>
  );

  switch (puzzle.type) {
    case 'memory':
      return (
        <MemoryPuzzle
          puzzle={puzzle}
          answer={answer}
          setAnswer={setAnswer}
          submitAnswer={submitAnswer}
          loading={loading}
          feedback={feedback}
        />
      );
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
    case 'spatial':
      return (
        <SpatialPuzzle
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