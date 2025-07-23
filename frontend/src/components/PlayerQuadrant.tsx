import React from 'react';
import './PlayerQuadrant.css';
import { PuzzleRenderer } from './puzzles/PuzzleRenderer';

interface PlayerData {
  id: number;
  username: string;
  color: string;
  points: number;
  isActive: boolean;
  isEliminated: boolean;
}

interface PlayerQuadrantProps {
  player: PlayerData;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  puzzle: any;
  readonly: boolean;
  answer: string;
  setAnswer: (answer: string) => void;
  submitAnswer: () => void;
  submitAnswerWithAnswer: (answer: string) => void;
  loading: boolean;
  feedback: string;
}

const PlayerQuadrant: React.FC<PlayerQuadrantProps> = ({
  player,
  position,
  puzzle,
  readonly,
  answer,
  setAnswer,
  submitAnswer,
  submitAnswerWithAnswer,
  loading,
  feedback
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'player-yellow';
      case 'red': return 'player-red';
      case 'blue': return 'player-blue';
      case 'green': return 'player-green';
      default: return 'player-yellow';
    }
  };

  const getPlayerColor = (color: string) => {
    switch (color) {
      case 'yellow': return '#ffc107';
      case 'red': return '#dc3545';
      case 'blue': return '#17a2b8';
      case 'green': return '#28a745';
      default: return '#ffc107';
    }
  };

  // Create array of 15 circles for life points
  const lifeCircles = Array.from({ length: 15 }, (_, index) => ({
    id: index,
    isActive: index < player.points
  }));

  return (
    <div className={`player-quadrant ${getColorClass(player.color)} ${position}`}>
      {/* Player Header */}
      <div className="player-header">
        <div className="player-info">
          <div className="player-name">{player.username}</div>
        </div>
        <div className="player-status">
          {player.isEliminated ? (
            <span className="status-eliminated">❌ ELIMINATED</span>
          ) : player.isActive ? (
            <span className="status-active">🟢 ACTIVE</span>
          ) : (
            <span className="status-waiting">⏳ WAITING</span>
          )}
        </div>
      </div>

      {/* Life Circles */}
      <div className="life-circles-container">
        {lifeCircles.map((circle) => (
          <div
            key={circle.id}
            className={`life-circle ${circle.isActive ? 'active' : 'inactive'}`}
            style={{
              backgroundColor: circle.isActive ? getPlayerColor(player.color) : '#e9ecef'
            }}
          />
        ))}
      </div>

      {/* Puzzle Area */}
      <div className="puzzle-area">
        {player.isEliminated ? (
          <div className="eliminated-message">
            <div className="eliminated-icon">💀</div>
            <div className="eliminated-text">ELIMINATED</div>
          </div>
        ) : (
          <PuzzleRenderer
            puzzle={puzzle}
            answer={answer}
            setAnswer={setAnswer}
            submitAnswer={submitAnswer}
            submitAnswerWithAnswer={submitAnswerWithAnswer}
            loading={loading}
            feedback={feedback}
            readonly={readonly}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerQuadrant; 