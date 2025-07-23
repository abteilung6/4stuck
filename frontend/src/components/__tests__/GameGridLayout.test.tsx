import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import GameGridLayout from '../GameGridLayout';

// Mock PuzzleRenderer for test isolation
vi.mock('../puzzles/PuzzleRenderer', () => ({
  PuzzleRenderer: ({ puzzle, readonly }: any) => (
    <div data-testid={`puzzle-${puzzle ? puzzle.user_id : 'none'}`}>{readonly ? 'readonly' : 'interactive'}</div>
  )
}));

describe('GameGridLayout', () => {
  const players = [
    { id: 1, username: 'Alice', color: 'yellow', points: 10, isActive: true, isEliminated: false },
    { id: 2, username: 'Bob', color: 'red', points: 8, isActive: false, isEliminated: false },
    { id: 3, username: 'Carol', color: 'blue', points: 0, isActive: false, isEliminated: true },
    { id: 4, username: 'Dave', color: 'green', points: 15, isActive: true, isEliminated: false }
  ];
  const puzzles = [
    { id: 101, user_id: 1, type: 'memory', status: 'active', data: {} },
    { id: 102, user_id: 2, type: 'spatial', status: 'active', data: {} },
    { id: 103, user_id: 4, type: 'concentration', status: 'active', data: {} }
  ];
  it('should render the game grid layout with 4 player quadrants', () => {
    render(
      <GameGridLayout
        players={players}
        puzzles={[]}
        localUserId={1}
        gameState="active"
        timeRemaining={0}
        answer=""
        setAnswer={() => {}}
        submitAnswer={() => {}}
        submitAnswerWithAnswer={() => {}}
        loading={false}
        feedback=""
      />
    );
    expect(screen.getAllByText(/Alice|Bob|Carol|Dave/).length).toBe(4);
  });
  it('should handle fewer than 4 players by adding placeholders', () => {
    render(
      <GameGridLayout
        players={players.slice(0, 2)}
        puzzles={[]}
        localUserId={1}
        gameState="active"
        timeRemaining={0}
        answer=""
        setAnswer={() => {}}
        submitAnswer={() => {}}
        submitAnswerWithAnswer={() => {}}
        loading={false}
        feedback=""
      />
    );
    expect(screen.getAllByText(/Player 3|Player 4/).length).toBe(2);
  });
  it('should display different game states correctly', () => {
    render(
      <GameGridLayout
        players={players}
        puzzles={[]}
        localUserId={1}
        gameState="lobby"
        timeRemaining={0}
        answer=""
        setAnswer={() => {}}
        submitAnswer={() => {}}
        submitAnswerWithAnswer={() => {}}
        loading={false}
        feedback=""
      />
    );
    expect(screen.getAllByText(/Alice|Bob|Carol|Dave/).length).toBe(4);
  });
  it('renders the correct puzzle for each player and sets readonly correctly', () => {
    render(
      <GameGridLayout
        players={players}
        puzzles={puzzles}
        localUserId={1}
        answer=""
        setAnswer={() => {}}
        submitAnswer={() => {}}
        submitAnswerWithAnswer={() => {}}
        loading={false}
        feedback=""
        gameState="active"
      />
    );
    // Local player (id 1) should be interactive
    expect(screen.getByTestId('puzzle-1')).toHaveTextContent('interactive');
    // Teammates (id 2, 4) should be readonly
    expect(screen.getByTestId('puzzle-2')).toHaveTextContent('readonly');
    expect(screen.getByTestId('puzzle-4')).toHaveTextContent('readonly');
    // Eliminated player (id 3) should not render a puzzle
    expect(screen.queryByTestId('puzzle-3')).toBeNull();
  });
}); 