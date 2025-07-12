import React, { useState, useEffect, useRef } from 'react';

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
      <div className="puzzle-content">
        <h3>Memory Puzzle</h3>
        <p>Memorize the color-number mapping below. You have {timeLeft} seconds left.</p>
        <div className="mapping-display">
          <h4>Color-Number Mapping:</h4>
          <div className="mapping-grid">
            {Object.entries(mapping as Record<string, string>).map(([number, color]) => (
              <div key={number} className="mapping-item">
                <span className="number">{number}</span>
                <span className="color">{color}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="puzzle-content">
      <h3>Memory Puzzle</h3>
      <p><strong>Question:</strong> What color is associated with the number {question_number}?</p>
      <form onSubmit={handleSubmit} className="answer-form">
        <div className="choices">
          {choices.map((choice: string) => (
            <label key={choice} className="choice-option">
              <input
                type="radio"
                name="answer"
                value={choice}
                checked={answer === choice}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={loading}
              />
              <span className="choice-text">{choice}</span>
            </label>
          ))}
        </div>
        <button type="submit" disabled={loading || !answer} className="submit-button">
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
      {feedback && (
        <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}; 