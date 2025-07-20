import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GameGridLayout from '../GameGridLayout';

describe('GameGridLayout', () => {
  const mockPlayers = [
    {
      id: 1,
      username: 'Player 1',
      color: 'yellow',
      points: 15,
      isActive: true,
      isEliminated: false
    },
    {
      id: 2,
      username: 'Player 2',
      color: 'red',
      points: 12,
      isActive: true,
      isEliminated: false
    },
    {
      id: 3,
      username: 'Player 3',
      color: 'blue',
      points: 8,
      isActive: false,
      isEliminated: false
    },
    {
      id: 4,
      username: 'Player 4',
      color: 'green',
      points: 0,
      isActive: false,
      isEliminated: true
    }
  ];

  it('should render the game grid layout with 4 player quadrants', () => {
    render(
      <GameGridLayout
        players={mockPlayers}
        gameState="active"
        timeRemaining={300}
      />
    );

    // Check that the game grid layout is rendered
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Player 4')).toBeInTheDocument();

    // Check that player statuses are displayed
    const activeElements = screen.getAllByText('🟢 ACTIVE');
    expect(activeElements).toHaveLength(2); // Player 1 and Player 2 are active
    expect(screen.getByText('⏳ WAITING')).toBeInTheDocument();
    expect(screen.getByText('❌ ELIMINATED')).toBeInTheDocument();
  });

  it('should handle fewer than 4 players by adding placeholders', () => {
    const fewerPlayers = mockPlayers.slice(0, 2); // Only 2 players

    render(
      <GameGridLayout
        players={fewerPlayers}
        gameState="active"
        timeRemaining={300}
      />
    );

    // Check that the original 2 players are displayed
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();

    // Check that placeholder players are added
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Player 4')).toBeInTheDocument();
  });

  it('should display different game states correctly', () => {
    render(
      <GameGridLayout
        players={mockPlayers}
        gameState="lobby"
      />
    );

    // Check that the game grid layout is rendered correctly
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Player 4')).toBeInTheDocument();

    // Check that player statuses are displayed
    const activeElements = screen.getAllByText('🟢 ACTIVE');
    expect(activeElements).toHaveLength(2); // Player 1 and Player 2 are active
    expect(screen.getByText('⏳ WAITING')).toBeInTheDocument();
    expect(screen.getByText('❌ ELIMINATED')).toBeInTheDocument();
  });
}); 