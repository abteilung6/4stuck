import type { Player, GameState, GameStatusInfo, GameStatus } from '../types/game';

/**
 * Pure function to determine if a player is eliminated
 */
export function isPlayerEliminated(player: Player): boolean {
  return player.points <= 0;
}

/**
 * Pure function to get the count of active players
 */
export function getActivePlayersCount(players: Player[]): number {
  return players.filter(player => !isPlayerEliminated(player)).length;
}

/**
 * Pure function to determine if the game is over
 */
export function isGameOverState(players: Player[]): boolean {
  return getActivePlayersCount(players) === 0;
}

/**
 * Pure function to get final standings (sorted by points)
 */
export function getFinalStandings(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.points - a.points);
}

/**
 * Pure function to determine if it's a player's turn
 */
export function isPlayerTurn(
  currentPlayerId: number,
  puzzle: any | null,
  isEliminated: boolean,
  isGameOver: boolean
): boolean {
  return !!puzzle && !isEliminated && !isGameOver;
}

/**
 * Pure function to determine if a specific player is eliminated
 */
export function isSpecificPlayerEliminated(players: Player[], playerId: number): boolean {
  const player = players.find(p => p.id === playerId);
  return player ? isPlayerEliminated(player) : false;
}

/**
 * Pure function to calculate game status
 */
export function calculateGameStatus(
  gameState: GameState,
  currentPlayerId: number,
  puzzle: any | null,
  wsConnected: boolean
): GameStatusInfo {
  const activePlayersCount = getActivePlayersCount(gameState.players);
  const isEliminated = isSpecificPlayerEliminated(gameState.players, currentPlayerId);
  const gameIsOver = isGameOverState(gameState.players);
  const isMyTurn = isPlayerTurn(currentPlayerId, puzzle, isEliminated, gameIsOver);
  const finalStandings = getFinalStandings(gameState.players);

  let status: GameStatus;

  if (!wsConnected) {
    status = 'loading';
  } else if (gameState.session.status === 'countdown') {
    status = 'countdown';
  } else if (gameIsOver) {
    status = 'gameOver';
  } else if (isEliminated) {
    status = 'eliminated';
  } else if (isMyTurn) {
    status = 'active';
  } else {
    status = 'waiting';
  }

  return {
    status,
    isMyTurn,
    isEliminated,
    isGameOver: gameIsOver,
    activePlayersCount,
    finalStandings
  };
}

/**
 * Pure function to validate game state
 */
export function validateGameState(gameState: GameState): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!gameState.session) {
    errors.push('Game session is required');
  }

  if (!gameState.team) {
    errors.push('Team is required');
  }

  if (!Array.isArray(gameState.players)) {
    errors.push('Players must be an array');
  }

  if (!Array.isArray(gameState.puzzles)) {
    errors.push('Puzzles must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Pure function to get player by ID
 */
export function getPlayerById(players: Player[], playerId: number): Player | undefined {
  return players.find(player => player.id === playerId);
}

/**
 * Pure function to get top players (for leaderboard)
 */
export function getTopPlayers(players: Player[], count: number = 3): Player[] {
  return getFinalStandings(players).slice(0, count);
}
