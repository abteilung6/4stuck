import React from 'react';

import { MemoryPuzzle } from './MemoryPuzzle';
import { SpatialPuzzle } from './SpatialPuzzle';
import ConcentrationPuzzle from './ConcentrationPuzzle';
import MultitaskingPuzzle from './MultitaskingPuzzle';
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
  readonly?: boolean;
}

export const PuzzleRenderer: React.FC<PuzzleRendererProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  submitAnswerWithAnswer,
  loading,
  feedback,
  readonly = false,
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
          readonly={readonly}
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
          readonly={readonly}
        />
      );
    case 'concentration':
      return (
        <ConcentrationPuzzle
          puzzle={{
            id: puzzle.id,
            type: puzzle.type,
            data: puzzle.data as { pairs: Array<{ color_word: string; circle_color: string; is_match: boolean }>; duration: number }
          }}
          onSolve={(answer) => {
            setAnswer(answer);
            // Submit the answer directly without relying on state
            submitAnswerWithAnswer(answer);
          }}
          onFail={(answer) => {
            setAnswer(answer);
            // Submit the answer directly without relying on state
            submitAnswerWithAnswer(answer);
          }}
          readonly={readonly}
        />
      );
    case 'multitasking':
      return (
        <MultitaskingPuzzle
          puzzle={puzzle}
          onSubmitAnswer={(answer) => {
            setAnswer(answer);
            // Submit the answer directly without relying on state
            submitAnswerWithAnswer(answer);
          }}
          submitAnswerWithAnswer={submitAnswerWithAnswer}
          readonly={readonly}
        />
      );
    default:
      return (
        <Card>
          <SectionTitle level={2}>Unknown Puzzle Type</SectionTitle>
          <BodyText color="secondary">Puzzle type '{puzzle.type}' is not supported.</BodyText>
        </Card>
      );
  }
};
