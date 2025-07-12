import React from 'react';

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
    <div className="puzzle-content">
      <p><strong>Type:</strong> {puzzle.type}</p>
      <p><strong>Question:</strong> {puzzle.data?.question || 'No question available'}</p>
      <form onSubmit={handleSubmit} className="answer-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer..."
          disabled={loading}
          className="answer-input"
        />
        <button type="submit" disabled={loading || !answer.trim()} className="submit-button">
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