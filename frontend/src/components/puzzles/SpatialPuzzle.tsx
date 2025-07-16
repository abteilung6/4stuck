import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Card from '../design-system/Card';
import SectionTitle from '../design-system/SectionTitle';
import { BodyText } from '../design-system/Typography';
import {
  checkCollision,
  checkWinCondition,
  updateObstaclePosition,
  calculateCirclePosition,
  isMouseInCircle,
  calculateDragOffset,
  getInitialGameState,
  processGameTick,
  type Position,
  type GameConfig,
  type GameState
} from '../../services/spatialPuzzleLogic';
import './SpatialPuzzle.css';

interface SpatialPuzzleProps {
  puzzle: {
    type: string;
    data: any; // Empty object from backend
  };
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  submitAnswerWithAnswer: (answer: string) => void;
  loading: boolean;
  feedback: string;
}



export const SpatialPuzzle: React.FC<SpatialPuzzleProps> = ({
  puzzle,
  answer,
  setAnswer,
  submitAnswer,
  submitAnswerWithAnswer,
  loading,
  feedback,
}) => {
  // Game configuration - memoized to prevent recreation
  const gameConfig: GameConfig = useMemo(() => ({
    gameWidth: 400,
    gameHeight: 600,
    circleRadius: 20,
    obstacleWidth: 80,
    obstacleHeight: 30,
    obstacleSpeed: 10.0
  }), []);
  
  // Get initial game state
  const initialGameState = getInitialGameState(gameConfig);
  
  // Game state
  const [circlePosition, setCirclePosition] = useState<Position>(initialGameState.circlePosition);
  const [obstaclePosition, setObstaclePosition] = useState<Position>(initialGameState.obstaclePosition);
  const [gameWon, setGameWon] = useState(initialGameState.gameWon);
  const [gameLost, setGameLost] = useState(initialGameState.gameLost);
  const [obstacleDirection, setObstacleDirection] = useState<'left' | 'right'>(initialGameState.obstacleDirection);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const animationRef = useRef<number>();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef({
    circlePosition,
    obstaclePosition,
    obstacleDirection,
    gameWon,
    gameLost
  });
  const callbacksRef = useRef({
    setAnswer,
    submitAnswer,
    submitAnswerWithAnswer
  });

  // Update refs when state or callbacks change
  useEffect(() => {
    gameStateRef.current = {
      circlePosition,
      obstaclePosition,
      obstacleDirection,
      gameWon,
      gameLost
    };
  }, [circlePosition, obstaclePosition, obstacleDirection, gameWon, gameLost]);

  useEffect(() => {
    callbacksRef.current = {
      setAnswer,
      submitAnswer,
      submitAnswerWithAnswer
    };
  }, [setAnswer, submitAnswer, submitAnswerWithAnswer]);

  // Simple game loop for obstacle animation
  const gameLoop = useCallback(() => {
    const currentState = gameStateRef.current;
    const callbacks = callbacksRef.current;
    
    if (currentState.gameWon || currentState.gameLost) return;

    // Update obstacle position using extracted logic
    const { newPosition: newObstaclePos, newDirection } = updateObstaclePosition(
      currentState.obstaclePosition,
      currentState.obstacleDirection,
      gameConfig.obstacleSpeed,
      gameConfig.gameWidth,
      gameConfig.obstacleWidth
    );

    setObstaclePosition(newObstaclePos);
    setObstacleDirection(newDirection);

    // Check collision using extracted logic
    if (checkCollision(
      currentState.circlePosition, 
      newObstaclePos, 
      gameConfig.circleRadius, 
      gameConfig.obstacleWidth, 
      gameConfig.obstacleHeight
    )) {
      setGameLost(true);
      callbacks.setAnswer('collision'); // Send a non-matching answer to indicate failure
      setTimeout(() => callbacks.submitAnswerWithAnswer('collision'), 1000);
      return;
    }

    // Check win condition using extracted logic
    if (checkWinCondition(
      currentState.circlePosition, 
      gameConfig.gameHeight, 
      gameConfig.circleRadius
    )) {
      setGameWon(true);
      callbacks.setAnswer('solved'); // This matches the backend's expected correct answer
      setTimeout(() => callbacks.submitAnswerWithAnswer('solved'), 500);
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameConfig]);

  // Start game loop
  useEffect(() => {
    gameLoop();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Mouse event handlers using extracted logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameWon || gameLost) return;
    
    const rect = gameContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isMouseInCircle(mouseX, mouseY, circlePosition, gameConfig.circleRadius)) {
      setIsDragging(true);
      setDragOffset(calculateDragOffset(mouseX, mouseY, circlePosition));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || gameWon || gameLost) return;
    
    const rect = gameContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newPosition = calculateCirclePosition(
      mouseX,
      mouseY,
      dragOffset,
      gameConfig.gameWidth,
      gameConfig.gameHeight,
      gameConfig.circleRadius
    );
    
    setCirclePosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset game state when puzzle changes
  useEffect(() => {
    const newInitialState = getInitialGameState(gameConfig);
    setCirclePosition(newInitialState.circlePosition);
    setObstaclePosition(newInitialState.obstaclePosition);
    setObstacleDirection(newInitialState.obstacleDirection);
    setGameWon(newInitialState.gameWon);
    setGameLost(newInitialState.gameLost);
  }, [puzzle, gameConfig]);

  return (
    <Card>
      <SectionTitle level={2}>Navigate the Circle</SectionTitle>
      <BodyText color="secondary">
        Drag the blue circle from the top to the bottom without touching the orange obstacle!
      </BodyText>
      
      <div className="spatial-puzzle-container">
        <div 
          ref={gameContainerRef}
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
              left: obstaclePosition.x,
              top: obstaclePosition.y,
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
              left: circlePosition.x,
              top: circlePosition.y,
              width: gameConfig.circleRadius * 2,
              height: gameConfig.circleRadius * 2,
              backgroundColor: gameLost ? '#FF0000' : '#0066CC',
              borderRadius: '50%',
              cursor: gameWon || gameLost ? 'default' : 'grab',
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
          {gameWon && (
            <div className="spatial-puzzle-overlay success">
              <h3>Success! 🎉</h3>
              <p>You reached the bottom safely!</p>
            </div>
          )}
          
          {gameLost && (
            <div className="spatial-puzzle-overlay failure">
              <h3>Game Over! 💥</h3>
              <p>You hit the obstacle. Try again!</p>
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