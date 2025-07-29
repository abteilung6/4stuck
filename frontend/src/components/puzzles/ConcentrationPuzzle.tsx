import React, { useCallback, useEffect } from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import { BodyText } from '../design-system/Typography';
import { useConcentrationGameState } from '../../hooks/useConcentrationGameState';
import { getColorValue, validateConcentrationPuzzleData, getGameProgress } from '../../services/concentrationPuzzleLogic';
import './ConcentrationPuzzle.css';

interface ConcentrationPuzzleProps {
  puzzle: {
    id: number;
    type: string;
    data: {
      pairs: Array<{ color_word: string; circle_color: string; is_match: boolean }>;
      duration: number;
    };
  };
  onSolve: (answer: string) => void;
  onFail: (answer: string) => void;
  readonly?: boolean;
}

const ConcentrationPuzzle: React.FC<ConcentrationPuzzleProps> = ({
  puzzle,
  onSolve,
  onFail,
  readonly = false,
}) => {
  // Validate puzzle data
  const validation = validateConcentrationPuzzleData(puzzle.data);
  if (!validation.isValid) {
    console.error('Invalid concentration puzzle data:', validation.errors);
    return (
      <Card>
        <SectionTitle level={2}>Invalid Puzzle Data</SectionTitle>
        <BodyText color="secondary">The puzzle data is invalid. Please try again.</BodyText>
      </Card>
    );
  }

  // Game state management
  const {
    gameState,
    currentPair,
    isGameActive,
    resetGame,
    resetCounter,
    handleClick
  } = useConcentrationGameState({
    puzzleData: puzzle.data,
    puzzleType: puzzle.type,
    puzzleId: puzzle.id
  });

  // Handle game completion
  useEffect(() => {
    if (gameState.isComplete && gameState.gameResult) {
      const answer = gameState.clickedIndex !== null
        ? String(gameState.clickedIndex)
        : 'timeout';

      if (gameState.gameResult === 'success') {
        onSolve(answer);
      } else {
        onFail(answer);
      }
    }
  }, [gameState.isComplete, gameState.gameResult, gameState.clickedIndex, onSolve, onFail]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Show completion state
  if (gameState.isComplete) {
    return (
      <Card>
        <SectionTitle level={2}>Concentration Puzzle</SectionTitle>
        <div className="concentration-completion">
          {gameState.gameResult === 'success' ? (
            <div className="success-message">
              <h3>Success! 🎉</h3>
              <p>You clicked at the right time!</p>
            </div>
          ) : (
            <div className="failure-message">
              <h3>Game Over! 💥</h3>
              <p>
                {gameState.clickedIndex !== null
                  ? "You clicked at the wrong time. Try again!"
                  : "Time's up! You didn't click in time. Try again!"
                }
              </p>
              <button
                onClick={handleRetry}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Show active game state
  if (!currentPair) {
    return (
      <Card>
        <SectionTitle level={2}>Concentration Puzzle</SectionTitle>
        <BodyText color="secondary">Loading puzzle...</BodyText>
      </Card>
    );
  }

  const progress = getGameProgress(gameState, puzzle.data.pairs.length);

  return (
    <Card>
      {readonly && <div className="spectator-overlay">Spectating</div>}
      <div className="concentration-puzzle" style={{ padding: 0, background: 'none', borderRadius: 0 }}>
        <div className="concentration-header">
          <div className="progress-info">
            <span>Pair {gameState.currentIndex + 1} / {puzzle.data.pairs.length}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
                data-testid="progress-bar"
              />
            </div>
          </div>
        </div>

        <div className="concentration-content">
          <div
            className="color-word"
            style={{ color: getColorValue(currentPair.color_word) }}
          >
            {currentPair.color_word.toUpperCase()}
          </div>

          <div
            className={`color-circle ${gameState.hasClicked ? 'clicked' : ''}`}
            style={{ backgroundColor: getColorValue(currentPair.circle_color) }}
            onClick={readonly ? undefined : handleClick}
            data-testid="color-circle"
          >
            {gameState.hasClicked && (
              <div className="click-feedback">
                {currentPair.is_match ? '\u2713' : '\u2717'}
              </div>
            )}
          </div>

          <div className="instruction">
            {currentPair.is_match
              ? "Click the circle - text and color match!"
              : "Don't click - text and color don't match!"
            }
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConcentrationPuzzle;
