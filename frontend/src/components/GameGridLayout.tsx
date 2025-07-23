import React from 'react';
import PlayerQuadrant from './PlayerQuadrant';
import './GameGridLayout.css';
import { PuzzleRenderer } from './puzzles/PuzzleRenderer';

interface PlayerData {
  id: number;
  username: string;
  color: string;
  points: number;
  isActive: boolean;
  isEliminated: boolean;
}

interface PuzzleData {
  id: number;
  user_id: number;
  type: string;
  status: string;
  data: any;
}

interface GameGridLayoutProps {
  players: PlayerData[];
  puzzles: PuzzleData[];
  localUserId: number;
  answer?: string;
  setAnswer?: (answer: string) => void;
  submitAnswer?: () => void;
  submitAnswerWithAnswer?: (answer: string) => void;
  loading?: boolean;
  feedback?: string;
  gameState: 'lobby' | 'countdown' | 'active' | 'finished';
  timeRemaining?: number;
}

const noop = () => {};

const GameGridLayout: React.FC<GameGridLayoutProps> = ({
  players,
  puzzles,
  localUserId,
  answer = '',
  setAnswer = noop,
  submitAnswer = noop,
  submitAnswerWithAnswer = noop,
  loading = false,
  feedback = '',
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

  // Map each player to their current puzzle
  const getPuzzleForPlayer = (playerId: number) =>
    puzzles.find((p) => p.user_id === playerId && p.status === 'active') || null;

  return (
    <div className="game-grid-container">
      {/* 2x2 Grid Layout */}
      <div className="game-grid">
        {displayPlayers.map((player, idx) => {
          const puzzle = getPuzzleForPlayer(player.id);
          const isLocal = player.id === localUserId;
          return (
            <PlayerQuadrant
              key={player.id}
              player={player}
              position={['top-left', 'top-right', 'bottom-left', 'bottom-right'][idx] as any}
              puzzle={puzzle}
              readonly={!isLocal}
              answer={isLocal ? answer : ''}
              setAnswer={isLocal ? setAnswer : noop}
              submitAnswer={isLocal ? submitAnswer : noop}
              submitAnswerWithAnswer={isLocal ? submitAnswerWithAnswer : noop}
              loading={isLocal ? loading : false}
              feedback={isLocal ? feedback : ''}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GameGridLayout; 