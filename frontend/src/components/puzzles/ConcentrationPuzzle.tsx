import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ConcentrationPuzzle.css';

interface Pair {
  color_word: string;
  circle_color: string;
  is_match: boolean;
}

interface ConcentrationPuzzleProps {
  puzzleData: {
    pairs: Pair[];
    duration: number; // seconds per pair
  };
  onSolve: (answer: string) => void;
  onFail: (answer: string) => void;
}

const ConcentrationPuzzle: React.FC<ConcentrationPuzzleProps> = ({
  puzzleData,
  onSolve,
  onFail
}) => {
  const { pairs, duration } = puzzleData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle through pairs
  useEffect(() => {
    if (hasClicked) return;
    if (currentIndex >= pairs.length) {
      // No click and all pairs shown: timeout
      onFail('timeout');
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, duration * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, hasClicked, pairs.length, duration, onFail]);

  // Handle circle click
  const handleCircleClick = useCallback(() => {
    if (hasClicked) return;
    setHasClicked(true);
    const answer = String(currentIndex);
    console.log('Concentration puzzle clicked:', {
      currentIndex,
      isMatch: pairs[currentIndex].is_match,
      answer,
      pairs: pairs.map((p, i) => ({ index: i, ...p }))
    });
    if (pairs[currentIndex].is_match) {
      console.log('Calling onSolve with answer:', answer);
      onSolve(answer);
    } else {
      console.log('Calling onFail with answer:', answer);
      onFail(answer);
    }
  }, [hasClicked, pairs, currentIndex, onSolve, onFail]);

  // Get CSS color from color name
  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#ff4444',
      blue: '#4444ff',
      yellow: '#ffff44',
      green: '#44ff44',
      purple: '#ff44ff',
      orange: '#ff8844'
    };
    return colorMap[colorName] || '#888888';
  };

  if (currentIndex >= pairs.length) {
    return (
      <div className="concentration-puzzle">
        <div className="concentration-header">
          <h3>Concentration Puzzle</h3>
          <p>Time's up!</p>
        </div>
      </div>
    );
  }

  const pair = pairs[currentIndex];

  return (
    <div className="concentration-puzzle">
      <div className="concentration-header">
        <h3>Concentration Puzzle</h3>
        <p>Click the circle ONLY when the text matches the color!</p>
        <div className="timer">Pair {currentIndex + 1} / {pairs.length}</div>
      </div>
      <div className="concentration-content">
        <div className="color-word" style={{ color: getColorValue(pair.color_word) }}>
          {pair.color_word.toUpperCase()}
        </div>
        <div
          className={`color-circle ${hasClicked ? 'clicked' : ''}`}
          style={{ backgroundColor: getColorValue(pair.circle_color) }}
          onClick={handleCircleClick}
        >
          {hasClicked && (
            <div className="click-feedback">
              {pair.is_match ? '✓' : '✗'}
            </div>
          )}
        </div>
        <div className="instruction">
          {pair.is_match
            ? "Click the circle - text and color match!"
            : "Don't click - text and color don't match!"
          }
        </div>
      </div>
    </div>
  );
};

export default ConcentrationPuzzle; 