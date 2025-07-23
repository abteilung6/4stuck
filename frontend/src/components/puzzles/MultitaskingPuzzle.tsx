import React from 'react';
import { extractMultitaskingPuzzleData, formatTime } from '../../utils/multitaskingPuzzleUtils';
import { useMultitaskingGameState } from '../../hooks/useMultitaskingGameState';
import './MultitaskingPuzzle.css';

interface MultitaskingPuzzleProps {
  puzzle: any;
  answer?: string;
  setAnswer?: (answer: string) => void;
  submitAnswer?: () => Promise<void>;
  submitAnswerWithAnswer: (answer: string) => Promise<void>;
  loading?: boolean;
  feedback?: string;
  readonly?: boolean;
}

const MultitaskingPuzzle: React.FC<MultitaskingPuzzleProps> = ({
  puzzle,
  submitAnswerWithAnswer,
  loading = false,
  feedback = '',
  readonly = false,
}) => {
  // Ensure 6s positions are stable for each puzzle instance
  const puzzleDataRef = React.useRef<{ id: any, data: any } | null>(null);
  if (!puzzleDataRef.current || puzzleDataRef.current.id !== puzzle?.id) {
    puzzleDataRef.current = { id: puzzle?.id, data: extractMultitaskingPuzzleData(puzzle?.data) };
  }
  const puzzleData = puzzleDataRef.current.data;

  const handleComplete = React.useCallback((foundPositions: number[]) => {
    const answer = foundPositions.join(',');
    submitAnswerWithAnswer(answer);
  }, [submitAnswerWithAnswer]);

  const handleTimeUp = React.useCallback(() => {
    // Time's up - submit empty answer to indicate failure
    submitAnswerWithAnswer('');
  }, [submitAnswerWithAnswer]);

  const {
    grid,
    foundPositions,
    timeRemaining,
    isComplete,
    isTimeUp,
    progress,
    handleDigitClick
  } = useMultitaskingGameState(puzzleData, handleComplete, handleTimeUp);

  if (!puzzleData) {
    return (
      <div className="multitasking-puzzle">
        <div className="error-message">
          ❌ Invalid puzzle data
        </div>
      </div>
    );
  }

  const isGameOver = isComplete || isTimeUp || loading;

  return (
    <div className="multitasking-puzzle">
      {readonly && <div className="spectator-overlay">Spectating</div>}
      <div className="timer-row">
        <div className="timer">Time: {formatTime(timeRemaining)}</div>
      </div>
      <div className="main-content">
        <div className="progress-container">
          <div className="progress-dots">
            {Array.from({ length: puzzleData.rows }, (_, index) => (
              <div
                key={index}
                className={`progress-dot ${foundPositions[index] !== undefined ? 'found' : ''}`}
              />
            ))}
          </div>
          <div className="progress-text">
            {foundPositions.length} of {puzzleData.rows} found
          </div>
        </div>
        <div className="number-grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {row.map((digit, colIndex) => {
                const isFound = foundPositions[rowIndex] === colIndex;
                const isClickable = !isGameOver && digit === '6' && !readonly;
                return (
                  <button
                    key={colIndex}
                    className={`grid-digit ${isFound ? 'found' : ''} ${isClickable ? 'clickable' : ''}`}
                    onClick={isClickable ? () => handleDigitClick(rowIndex, colIndex) : undefined}
                    disabled={!isClickable || isGameOver || readonly}
                    aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}: ${digit}`}
                  >
                    {digit}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {isGameOver && (
          <div className="game-over">
            {isComplete && <div className="success">✅ All 6s found!</div>}
            {isTimeUp && <div className="time-up">⏰ Time's up!</div>}
            {loading && <div className="loading">Submitting...</div>}
            {feedback && <div className="feedback">{feedback}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultitaskingPuzzle; 