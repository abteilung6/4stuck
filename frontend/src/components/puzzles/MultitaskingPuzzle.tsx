import React, { useState, useEffect, useCallback } from 'react';
import './MultitaskingPuzzle.css';
import { generateMultitaskingGrid, isSixCellClicked } from '../../services/multitaskingPuzzleLogic';
import type { GridCell, SixPosition } from '../../services/multitaskingPuzzleLogic';

interface MultitaskingPuzzleProps {
  onSubmitAnswer: (answer: string) => void;
  submitAnswerWithAnswer?: (answer: string) => void;
}

const MultitaskingPuzzle: React.FC<MultitaskingPuzzleProps> = ({ 
  onSubmitAnswer, 
  submitAnswerWithAnswer 
}) => {
  const rows = 3;
  const cols = 9;
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [foundSix, setFoundSix] = useState<string | null>(null);
  const [sixPosition, setSixPosition] = useState<SixPosition | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isComplete, setIsComplete] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Generate the grid with only one 6 in the entire grid
  const generateGrid = useCallback(() => {
    const { grid: newGrid, sixPosition: newSixPosition } = generateMultitaskingGrid(rows, cols);
    setSixPosition(newSixPosition);
    setGrid(newGrid);
    setFoundSix(null);
    setIsComplete(false);
    setTimeLeft(10);
    setHasSubmitted(false);
  }, [rows, cols]);

  // Initialize grid on component mount
  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isComplete || hasSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isComplete, hasSubmitted]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (isComplete || timeLeft <= 0 || hasSubmitted) return;
    if (isSixCellClicked(row, col, sixPosition)) {
      setFoundSix(`${row}-${col}`);
      setGrid(prev => prev.map((rowData, r) =>
        rowData.map((cellData, c) =>
          r === row && c === col ? { ...cellData, isFound: true } : cellData
        )
      ));
      setIsComplete(true);
    }
  }, [isComplete, timeLeft, hasSubmitted, sixPosition]);

  // Submit answer when puzzle is completed (either found or time out)
  useEffect(() => {
    if (!isComplete || hasSubmitted) return;
    
    const submitAnswer = () => {
      setHasSubmitted(true);
      const answer = foundSix ? 'solved' : 'failed';
      console.log('Multitasking puzzle submitting answer:', answer);
      
      if (submitAnswerWithAnswer) {
        submitAnswerWithAnswer(answer);
      } else {
        onSubmitAnswer(answer);
      }
    };

    // Small delay to ensure state updates are complete
    const timeoutId = setTimeout(submitAnswer, 100);
    return () => clearTimeout(timeoutId);
  }, [isComplete, foundSix, onSubmitAnswer, submitAnswerWithAnswer, hasSubmitted]);

  // Format time display
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="multitasking-puzzle">
      <div className="puzzle-header">
        <h3>FIND THE SIX</h3>
        <div className="timer">Time: {formatTime(timeLeft)}</div>
      </div>

      <div className="progress-dots">
        <div className={`progress-dot ${foundSix ? 'found' : ''}`} />
      </div>

      <div className="number-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${cell.isFound ? 'found' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={isComplete || timeLeft <= 0}
              >
                {cell.value}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="puzzle-instructions">
        <p>Click on the only 6 in the grid. You have 10 seconds!</p>
        <p>{foundSix ? 'You found the 6!' : 'Not found yet.'}</p>
      </div>
    </div>
  );
};

export default MultitaskingPuzzle; 