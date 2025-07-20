import React, { useState } from 'react';
import GameGridLayout from './GameGridLayout';

const GameGridLayoutDemo: React.FC = () => {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'active' | 'finished'>('active');
  const [timeRemaining, setTimeRemaining] = useState(300);

  const demoPlayers = [
    {
      id: 1,
      username: 'Alice',
      color: 'yellow',
      points: 15,
      isActive: true,
      isEliminated: false
    },
    {
      id: 2,
      username: 'Bob',
      color: 'red',
      points: 8,
      isActive: true,
      isEliminated: false
    },
    {
      id: 3,
      username: 'Charlie',
      color: 'blue',
      points: 3,
      isActive: false,
      isEliminated: false
    },
    {
      id: 4,
      username: 'Diana',
      color: 'green',
      points: 0,
      isActive: false,
      isEliminated: true
    }
  ];

  const handleStateChange = (newState: typeof gameState) => {
    setGameState(newState);
    if (newState === 'active') {
      setTimeRemaining(300);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Demo Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => handleStateChange('lobby')}
          style={{
            padding: '5px 10px',
            background: gameState === 'lobby' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Lobby
        </button>
        <button 
          onClick={() => handleStateChange('countdown')}
          style={{
            padding: '5px 10px',
            background: gameState === 'countdown' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Countdown
        </button>
        <button 
          onClick={() => handleStateChange('active')}
          style={{
            padding: '5px 10px',
            background: gameState === 'active' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Active
        </button>
        <button 
          onClick={() => handleStateChange('finished')}
          style={{
            padding: '5px 10px',
            background: gameState === 'finished' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Finished
        </button>
        <div style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>
          Current: {gameState}
        </div>
      </div>

      <GameGridLayout
        players={demoPlayers}
        gameState={gameState}
        timeRemaining={gameState === 'active' ? timeRemaining : undefined}
      />
    </div>
  );
};

export default GameGridLayoutDemo; 