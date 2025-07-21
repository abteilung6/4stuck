import React, { useMemo, useEffect, useCallback } from 'react';
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
  // Game configuration with validation
  const gameConfig = useMemo(() => {
    const config = getDefaultGameConfig();
    const validation = validateGameConfig(config);
    
    if (!validation.isValid) {
      console.error('Invalid game config:', validation.errors);
    }
    
    return config;
  }, []);

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
    containerRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  } = useSpatialMouseHandling({
    gameConfig,
    circlePosition: gameState.circlePosition,
    isGameActive,
    onCirclePositionChange: setCirclePosition
  });

  // Start game loop when component mounts or game becomes active
  useEffect(() => {
    if (isGameActive) {
      startGameLoop();
    } else {
      stopGameLoop();
    }
  }, [isGameActive, startGameLoop, stopGameLoop]);

  // Restart game loop when puzzle changes or game is reset
  useEffect(() => {
    if (puzzle?.type && isGameActive) {
      const timer = setTimeout(() => {
        startGameLoop();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [puzzle?.type, isGameActive, resetCounter, startGameLoop]);

  return (
    <Card>
      <SectionTitle level={2}>Navigate the Circle</SectionTitle>
      {readonly && <div className="spectator-overlay">Spectating</div>}
      <BodyText color="secondary">
        Drag the blue circle from the top to the bottom without touching the orange obstacle!
      </BodyText>
      
      <div className="spatial-puzzle-container">
        <div 
          ref={containerRef}
          className="spatial-puzzle-game-area"
          style={{
            width: gameConfig.gameWidth,
            height: gameConfig.gameHeight,
            position: 'relative',
            border: '2px solid #333',
            borderRadius: '8px',
            backgroundColor: '#f0f0f0',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onMouseDown={readonly ? undefined : handleMouseDown}
          onMouseMove={readonly ? undefined : handleMouseMove}
          onMouseUp={readonly ? undefined : handleMouseUp}
          onMouseLeave={readonly ? undefined : handleMouseLeave}
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
              transition: 'none' // Disable CSS transitions for smooth animation
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
              pointerEvents: 'none' // Let parent handle mouse events
            }}
          />
          
          {/* Start zone indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
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
              height: '40px',
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
      </div>
      
      {feedback && (
        <div className={`spatial-puzzle-feedback ${feedback.includes('Success') ? 'success' : 'error'}`}>
          {feedback}
        </div>
      )}
    </Card>
  );
}; 