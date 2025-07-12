import React from 'react';

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
    <div className="puzzle-content">
      <p><strong>Type:</strong> {puzzle.type}</p>
      <p><strong>Question:</strong> {puzzle.data?.question || 'No question available'}</p>
      <form onSubmit={handleSubmit} className="answer-form">
        {choices.map((choice, idx) => (
          <label key={idx} className="choice-label">
            <input
              type="radio"
              name="multiple-choice-answer"
              value={choice}
              checked={answer === choice}
              onChange={() => setAnswer(choice)}
              disabled={loading}
            />
            {choice}
          </label>
        ))}
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