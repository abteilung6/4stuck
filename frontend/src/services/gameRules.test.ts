import {
  isPlayerEliminated,
  getActivePlayersCount,
  isGameOverState,
  getFinalStandings,
  isPlayerTurn,
  isSpecificPlayerEliminated,
  calculateGameStatus,
  validateGameState,
  getPlayerById,
  getTopPlayers
} from './gameRules';
import type { Player, GameState } from '../types/game';
import { expect, describe, it } from 'vitest'

describe('Game Rules', () => {
  const mockPlayers: Player[] = [
    { id: 1, username: 'player1', points: 15 },
    { id: 2, username: 'player2', points: 10 },
    { id: 3, username: 'player3', points: 0 },
    { id: 4, username: 'player4', points: 5 }
  ];

  const mockGameState: GameState = {
    session: { id: 1, status: 'active' },
    team: { id: 1, name: 'Test Team' },
    players: mockPlayers,
    puzzles: []
  };

  describe('isPlayerEliminated', () => {
    it('should return true for player with 0 points', () => {
      const player: Player = { id: 1, username: 'test', points: 0 };
      expect(isPlayerEliminated(player)).toBe(true);
    });

    it('should return true for player with negative points', () => {
      const player: Player = { id: 1, username: 'test', points: -5 };
      expect(isPlayerEliminated(player)).toBe(true);
    });

    it('should return false for player with positive points', () => {
      const player: Player = { id: 1, username: 'test', points: 10 };
      expect(isPlayerEliminated(player)).toBe(false);
    });
  });

  describe('getActivePlayersCount', () => {
    it('should return correct count of active players', () => {
      expect(getActivePlayersCount(mockPlayers)).toBe(3); // 15, 10, 5 points
    });

    it('should return 0 when all players are eliminated', () => {
      const eliminatedPlayers: Player[] = [
        { id: 1, username: 'player1', points: 0 },
        { id: 2, username: 'player2', points: 0 }
      ];
      expect(getActivePlayersCount(eliminatedPlayers)).toBe(0);
    });

    it('should return total count when no players are eliminated', () => {
      const activePlayers: Player[] = [
        { id: 1, username: 'player1', points: 15 },
        { id: 2, username: 'player2', points: 10 }
      ];
      expect(getActivePlayersCount(activePlayers)).toBe(2);
    });
  });

  describe('isGameOverState', () => {
    it('should return true when all players are eliminated', () => {
      const eliminatedPlayers: Player[] = [
        { id: 1, username: 'player1', points: 0 },
        { id: 2, username: 'player2', points: 0 }
      ];
      expect(isGameOverState(eliminatedPlayers)).toBe(true);
    });

    it('should return false when some players are still active', () => {
      expect(isGameOverState(mockPlayers)).toBe(false);
    });

    it('should return false when all players have positive points', () => {
      const activePlayers: Player[] = [
        { id: 1, username: 'player1', points: 15 },
        { id: 2, username: 'player2', points: 10 }
      ];
      expect(isGameOverState(activePlayers)).toBe(false);
    });
  });

  describe('getFinalStandings', () => {
    it('should return players sorted by points in descending order', () => {
      const standings = getFinalStandings(mockPlayers);
      expect(standings[0].points).toBe(15);
      expect(standings[1].points).toBe(10);
      expect(standings[2].points).toBe(5);
      expect(standings[3].points).toBe(0);
    });

    it('should not mutate the original array', () => {
      const originalPlayers = [...mockPlayers];
      getFinalStandings(mockPlayers);
      expect(mockPlayers).toEqual(originalPlayers);
    });
  });

  describe('isPlayerTurn', () => {
    it('should return true when player has puzzle and is not eliminated', () => {
      const result = isPlayerTurn(1, { id: 1, type: 'test' }, false, false);
      expect(result).toBe(true);
    });

    it('should return false when player is eliminated', () => {
      const result = isPlayerTurn(1, { id: 1, type: 'test' }, true, false);
      expect(result).toBe(false);
    });

    it('should return false when game is over', () => {
      const result = isPlayerTurn(1, { id: 1, type: 'test' }, false, true);
      expect(result).toBe(false);
    });

    it('should return false when no puzzle is available', () => {
      const result = isPlayerTurn(1, null, false, false);
      expect(result).toBe(false);
    });
  });

  describe('isSpecificPlayerEliminated', () => {
    it('should return true for eliminated player', () => {
      expect(isSpecificPlayerEliminated(mockPlayers, 3)).toBe(true); // player3 has 0 points
    });

    it('should return false for active player', () => {
      expect(isSpecificPlayerEliminated(mockPlayers, 1)).toBe(false); // player1 has 15 points
    });

    it('should return false for non-existent player', () => {
      expect(isSpecificPlayerEliminated(mockPlayers, 999)).toBe(false);
    });
  });

  describe('calculateGameStatus', () => {
    it('should return loading status when WebSocket is not connected', () => {
      const status = calculateGameStatus(mockGameState, 1, null, false);
      expect(status.status).toBe('loading');
    });

    it('should return gameOver status when all players are eliminated', () => {
      const eliminatedGameState: GameState = {
        ...mockGameState,
        players: [
          { id: 1, username: 'player1', points: 0 },
          { id: 2, username: 'player2', points: 0 }
        ]
      };
      const status = calculateGameStatus(eliminatedGameState, 1, null, true);
      expect(status.status).toBe('gameOver');
    });

    it('should return eliminated status when specific player is eliminated', () => {
      const status = calculateGameStatus(mockGameState, 3, null, true); // player3 has 0 points
      expect(status.status).toBe('eliminated');
    });

    it('should return active status when it is player turn', () => {
      const status = calculateGameStatus(mockGameState, 1, { id: 1, type: 'test' }, true);
      expect(status.status).toBe('active');
    });

    it('should return waiting status when not player turn', () => {
      const status = calculateGameStatus(mockGameState, 1, null, true);
      expect(status.status).toBe('waiting');
    });

    it('should calculate correct active players count', () => {
      const status = calculateGameStatus(mockGameState, 1, null, true);
      expect(status.activePlayersCount).toBe(3);
    });

    it('should provide correct final standings', () => {
      const status = calculateGameStatus(mockGameState, 1, null, true);
      expect(status.finalStandings).toHaveLength(4);
      expect(status.finalStandings[0].points).toBe(15);
    });
  });

  describe('validateGameState', () => {
    it('should return valid for correct game state', () => {
      const result = validateGameState(mockGameState);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when session is missing', () => {
      const invalidState = { ...mockGameState, session: null as any };
      const result = validateGameState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Game session is required');
    });

    it('should return invalid when team is missing', () => {
      const invalidState = { ...mockGameState, team: null as any };
      const result = validateGameState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Team is required');
    });

    it('should return invalid when players is not an array', () => {
      const invalidState = { ...mockGameState, players: 'not an array' as any };
      const result = validateGameState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Players must be an array');
    });

    it('should return invalid when puzzles is not an array', () => {
      const invalidState = { ...mockGameState, puzzles: 'not an array' as any };
      const result = validateGameState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Puzzles must be an array');
    });
  });

  describe('getPlayerById', () => {
    it('should return player when found', () => {
      const player = getPlayerById(mockPlayers, 1);
      expect(player).toEqual(mockPlayers[0]);
    });

    it('should return undefined when player not found', () => {
      const player = getPlayerById(mockPlayers, 999);
      expect(player).toBeUndefined();
    });
  });

  describe('getTopPlayers', () => {
    it('should return top 3 players by default', () => {
      const topPlayers = getTopPlayers(mockPlayers);
      expect(topPlayers).toHaveLength(3);
      expect(topPlayers[0].points).toBe(15);
      expect(topPlayers[1].points).toBe(10);
      expect(topPlayers[2].points).toBe(5);
    });

    it('should return specified number of top players', () => {
      const topPlayers = getTopPlayers(mockPlayers, 2);
      expect(topPlayers).toHaveLength(2);
      expect(topPlayers[0].points).toBe(15);
      expect(topPlayers[1].points).toBe(10);
    });

    it('should return all players when count exceeds array length', () => {
      const topPlayers = getTopPlayers(mockPlayers, 10);
      expect(topPlayers).toHaveLength(4);
    });
  });
}); 