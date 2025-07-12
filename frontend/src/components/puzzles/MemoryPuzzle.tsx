import React, { useState, useEffect, useRef } from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import Button from '../design-system/Button';
import StatusMessage from '../design-system/StatusMessage';
import { QuestionText, ChoiceText } from '../design-system/Typography';

export interface MemoryPuzzleProps {
  puzzle: any;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  loading: boolean;
  feedback: string;
}

export const MemoryPuzzle: React.FC<MemoryPuzzleProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  feedback,
}) => {
  const [showMapping, setShowMapping] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);
  const lastPuzzleId = useRef<number | undefined>(undefined);

  // Only reset timer if puzzle id truly changes
  useEffect(() => {
    if (puzzle?.id == null) return;
    if (lastPuzzleId.current === puzzle.id) return;
    setShowMapping(true);
    setTimeLeft(5);
    lastPuzzleId.current = puzzle.id;
  }, [puzzle ? puzzle.id : undefined]);

  useEffect(() => {
    if (!showMapping) return;
    if (timeLeft <= 0) {
      setShowMapping(false);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showMapping, timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };

  if (!puzzle.data) {
    return <p>Invalid puzzle data.</p>;
  }

  const { mapping, question_number, choices } = puzzle.data;

  if (showMapping) {
    return (
      <Card>
        <SectionTitle level={2}>Memory Puzzle</SectionTitle>
        <QuestionText>Memorize the color-number mapping below. You have {timeLeft} seconds left.</QuestionText>
        <div className="mapping-display" aria-label="Color-Number Mapping">
          <SectionTitle level={3} className="sr-only">Color-Number Mapping</SectionTitle>
          <div className="mapping-grid">
            {Object.entries(mapping as Record<string, string>).map(([number, color]) => (
              <div key={number} className="mapping-item" aria-label={`Number ${number} is ${color}`}>
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
      <SectionTitle level={2}>Memory Puzzle</SectionTitle>
      <QuestionText><strong>Question:</strong> What color is associated with the number {question_number}?</QuestionText>
      <form onSubmit={handleSubmit} className="answer-form">
        <div className="choices" role="radiogroup" aria-label="Choices">
          {choices.map((choice: string) => (
            <label key={choice} className="choice-option" aria-label={choice}>
              <input
                type="radio"
                name="answer"
                value={choice}
                checked={answer === choice}
                onChange={(e) => setAnswer(e.target.value)}
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