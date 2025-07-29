import React, { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import { BodyText } from '../design-system/Typography';
import { getDefaultGameConfig, validateGameConfig } from '../../services/spatialPuzzleLogic';
import { useSpatialGameState } from '../../hooks/useSpatialGameState';
import { useSpatialGameLoop } from '../../hooks/useSpatialGameLoop';
import { useSpatialMouseHandling } from '../../hooks/useSpatialMouseHandling';
import './SpatialPuzzle.css';

interface SpatialPuzzleProps {
  puzzle: {
    id: number;
    type: string;
    data: any; // Empty object from backend
  };
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  submitAnswerWithAnswer: (answer: string) => void;
  loading: boolean;
  feedback: string;
  readonly?: boolean;
}

export const SpatialPuzzle: React.FC<SpatialPuzzleProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  submitAnswerWithAnswer,
  loading,
  feedback,
  readonly = false,
}) => {
  // Responsive container ref and size state
  const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [containerSize, setContainerSize] = useState({ width: 300, height: 300 });

  // Observe parent size for responsiveness
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Log initial circle position on mount
  useEffect(() => {
    if (puzzle && puzzle.data && puzzle.data.circlePosition) {
    }
  }, [puzzle]);

  // Game configuration with validation, now based on container size
  const gameConfig = useMemo(() => {
    // Use a base aspect ratio (e.g., 1:1 or 2:3)
    const width = containerSize.width;
    const height = containerSize.height;
    // Scale obstacle and circle sizes relative to container
    return {
      gameWidth: width,
      gameHeight: height,
      circleRadius: Math.max(16, Math.min(width, height) * 0.07),
      obstacleWidth: Math.max(40, width * 0.25),
      obstacleHeight: Math.max(20, height * 0.08),
      obstacleSpeed: 10.0
    };
  }, [containerSize]);

  // Game state management
  const {
    gameState,
    isGameActive,
    resetCounter,
    setCirclePosition,
    setObstaclePosition,
    setObstacleDirection,
    setGameWon,
    setGameLost,
    resetGame
  } = useSpatialGameState({
    gameConfig,
    puzzleType: puzzle?.type || null,
    puzzleId: puzzle?.id || null
  });

  // Handle retry button click
  const handleRetry = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Game callbacks
  const gameCallbacks = useMemo(() => ({
    setAnswer,
    submitAnswer,
    submitAnswerWithAnswer
  }), [setAnswer, submitAnswer, submitAnswerWithAnswer]);

  // State setters for game loop
  const stateSetters = useMemo(() => ({
    setObstaclePosition,
    setObstacleDirection,
    setGameWon,
    setGameLost
  }), [setObstaclePosition, setObstacleDirection, setGameWon, setGameLost]);

  // Game loop management
  const { startGameLoop, stopGameLoop } = useSpatialGameLoop({
    gameState,
    gameConfig,
    callbacks: gameCallbacks,
    stateSetters,
    isActive: isGameActive
  });

  // Mouse handling
  const {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  } = useSpatialMouseHandling({
    gameConfig,
    circlePosition: gameState.circlePosition,
    isGameActive,
    onCirclePositionChange: setCirclePosition,
    containerRef
  });

  // Start game loop when component mounts or game becomes active
  useEffect(() => {
    if (isGameActive) {
      startGameLoop();
    } else {
      stopGameLoop();
    }
  }, [isGameActive, startGameLoop, stopGameLoop]);

  // Remove the redundant game loop restart effect that was causing multiple submissions

  // Add a log when checking win condition
  const checkWin = useCallback((
    circlePos: { x: number; y: number },
    gameHeight: number,
    circleRadius: number
  ) => {
    const circleBottom = circlePos.y + circleRadius * 2;
    const win = circleBottom >= gameHeight - 10;
    return win;
  }, []);

  return (
    <Card>
      {readonly && <div className="spectator-overlay">Spectating</div>}
        <div
          ref={containerRef}
        className="spatial-puzzle-container spatial-puzzle-game-area"
          style={{
          width: '100%',
          height: '100%',
          minWidth: 300,
          minHeight: 300,
            position: 'relative',
          touchAction: 'none',
          userSelect: 'none',
          boxSizing: 'border-box',
          }}
        data-testid="spatial-puzzle-area"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        >
          {/* Orange obstacle */}
          <div
            className="spatial-puzzle-obstacle"
            style={{
              position: 'absolute',
              left: gameState.obstaclePosition.x,
              top: gameState.obstaclePosition.y,
              width: gameConfig.obstacleWidth,
              height: gameConfig.obstacleHeight,
              backgroundColor: '#FF8C00',
              borderRadius: '4px',
            transition: 'none'
            }}
          />
          {/* Blue circle (draggable) */}
          <div
            className="spatial-puzzle-circle"
            style={{
              position: 'absolute',
              left: gameState.circlePosition.x,
              top: gameState.circlePosition.y,
              width: gameConfig.circleRadius * 2,
              height: gameConfig.circleRadius * 2,
              backgroundColor: gameState.gameLost ? '#FF0000' : '#0066CC',
              borderRadius: '50%',
              cursor: gameState.gameWon || gameState.gameLost ? 'default' : 'grab',
              border: '2px solid #004499',
            pointerEvents: 'none'
            }}
          />
          {/* Start zone indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            height: Math.max(24, gameConfig.gameHeight * 0.12),
              border: '2px dashed #00FF00',
              borderBottom: 'none',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              pointerEvents: 'none'
            }}
          />
          {/* End zone indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            height: Math.max(24, gameConfig.gameHeight * 0.12),
              border: '2px dashed #00FF00',
              borderTop: 'none',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              pointerEvents: 'none'
            }}
          />
          {/* Game state overlays */}
          {gameState.gameWon && !loading && (
            <div className="spatial-puzzle-overlay success">
              <h3>Success! 🎉</h3>
              <p>You reached the bottom safely!</p>
            </div>
          )}
          {gameState.gameLost && !loading && (
            <div className="spatial-puzzle-overlay failure">
              <h3>Game Over! 💥</h3>
              <p>You hit the obstacle. Try again!</p>
              <button
              onClick={readonly ? undefined : handleRetry}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#0066CC',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                cursor: readonly ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              disabled={readonly}
              onMouseOver={readonly ? undefined : (e) => {
                  e.currentTarget.style.backgroundColor = '#004499';
                }}
              onMouseOut={readonly ? undefined : (e) => {
                  e.currentTarget.style.backgroundColor = '#0066CC';
                }}
              >
                Try Again
              </button>
            </div>
          )}
          {loading && (
            <div className="spatial-puzzle-overlay loading">
              <p>Processing...</p>
            </div>
          )}
        </div>
      {feedback && (
        <div className={`spatial-puzzle-feedback ${feedback.includes('Success') ? 'success' : 'error'}`}>
          {feedback}
        </div>
      )}
    </Card>
  );
};
