import React from 'react';
import PlayerQuadrant from './PlayerQuadrant';
import './GameGridLayout.css';

interface PlayerData {
  id: number;
  username: string;
  color: string;
  points: number;
  isActive: boolean;
  isEliminated: boolean;
}

interface GameGridLayoutProps {
  players: PlayerData[];
  gameState: 'lobby' | 'countdown' | 'active' | 'finished';
  timeRemaining?: number;
}

const GameGridLayout: React.FC<GameGridLayoutProps> = ({
  players,
  gameState,
  timeRemaining
}) => {
  // Ensure we have exactly 4 players (fill with placeholders if needed)
  const displayPlayers = [...players];
  while (displayPlayers.length < 4) {
    displayPlayers.push({
      id: displayPlayers.length + 1,
      username: `Player ${displayPlayers.length + 1}`,
      color: ['yellow', 'red', 'blue', 'green'][displayPlayers.length],
      points: 15,
      isActive: false,
      isEliminated: false
    });
  }

  return (
    <div className="game-grid-container">
      {/* 2x2 Grid Layout */}
      <div className="game-grid">
        {/* Top Row */}
        <PlayerQuadrant 
          player={displayPlayers[0]} 
          position="top-left"
        />
        <PlayerQuadrant 
          player={displayPlayers[1]} 
          position="top-right"
        />
        
        {/* Bottom Row */}
        <PlayerQuadrant 
          player={displayPlayers[2]} 
          position="bottom-left"
        />
        <PlayerQuadrant 
          player={displayPlayers[3]} 
          position="bottom-right"
        />
      </div>
    </div>
  );
};

export default GameGridLayout; 