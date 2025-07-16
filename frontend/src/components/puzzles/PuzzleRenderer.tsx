import React from 'react';
import { TextPuzzle } from './TextPuzzle';
import { MultipleChoicePuzzle } from './MultipleChoicePuzzle';
import { MemoryPuzzle } from './MemoryPuzzle';
import { SpatialPuzzle } from './SpatialPuzzle';
import ConcentrationPuzzle from './ConcentrationPuzzle';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import { BodyText } from '../design-system/Typography';
import type { components } from '../../api-types';

export interface PuzzleRendererProps {
  puzzle: components['schemas']['PuzzleState'] | null;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  submitAnswerWithAnswer: (answer: string) => void;
  loading: boolean;
  feedback: string;
}

export const PuzzleRenderer: React.FC<PuzzleRendererProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  submitAnswerWithAnswer,
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
          submitAnswerWithAnswer={submitAnswerWithAnswer}
          loading={loading}
          feedback={feedback}
        />
      );
    case 'concentration':
      return (
        <ConcentrationPuzzle
          puzzleData={puzzle.data as { pairs: Array<{ color_word: string; circle_color: string; is_match: boolean }>; duration: number }}
          onSolve={(answer) => {
            console.log('Concentration puzzle onSolve called with:', answer);
            setAnswer(answer);
            // Submit the answer directly without relying on state
            submitAnswerWithAnswer(answer);
          }}
          onFail={(answer) => {
            console.log('Concentration puzzle onFail called with:', answer);
            setAnswer(answer);
            // Submit the answer directly without relying on state
            submitAnswerWithAnswer(answer);
          }}
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