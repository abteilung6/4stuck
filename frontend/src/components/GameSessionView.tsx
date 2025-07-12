import React, { useEffect, useState, useRef } from 'react';
import { PuzzleService } from '../api/services/PuzzleService';
import type { GameSessionOut } from '../api/models/GameSessionOut';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import type { PuzzleState } from '../api/models/PuzzleState';
import type { PuzzleResult } from '../api/models/PuzzleResult';
import './GameSessionView.css'; // Add a CSS file for styles

interface GameState {
  session: { id: number; status: string };
  team: { id: number; name: string };
  players: Array<{ id: number; username: string; points: number }>;
  puzzles: Array<{ id: number; user_id: number; type: string; status: string; data: any }>;
}

interface GameSessionViewProps {
  session: GameSessionOut;
  user: { id: number; username: string };
  team: TeamWithMembersOut;
}

const GameSessionView: React.FC<GameSessionViewProps> = ({ session, user, team }) => {
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState<GameState['players']>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalStandings, setFinalStandings] = useState<GameState['players']>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch current puzzle for the user
  const fetchPuzzle = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await PuzzleService.getCurrentPuzzlePuzzleCurrentUserIdGet(user.id);
      setPuzzle(data);
    } catch (err) {
      setError('No active puzzle for you right now.');
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket setup for real-time game state
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${session.id}`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const state: GameState = JSON.parse(event.data);
      setPlayers(state.players);
      setWsConnected(true);
      // Detect elimination
      const me = state.players.find(p => p.id === user.id);
      if (me && me.points <= 0) setIsEliminated(true);
      // Detect game over (all players eliminated)
      const activePlayers = state.players.filter(p => p.points > 0);
      if (activePlayers.length === 0) {
        setGameOver(true);
        setFinalStandings([...state.players].sort((a, b) => b.points - a.points));
      }
      setNotifications((prev) => [
        `Game state updated at ${new Date().toLocaleTimeString()}`,
        ...prev.slice(0, 4)
      ]);
    };
    ws.onerror = () => setNotifications((prev) => ["WebSocket error", ...prev]);
    ws.onclose = () => setNotifications((prev) => ["WebSocket closed", ...prev]);
    return () => { ws.close(); };
    // eslint-disable-next-line
  }, [session.id]);

  useEffect(() => {
    fetchPuzzle();
    // Optionally, set up polling or WebSocket for real-time updates
    // eslint-disable-next-line
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle) return;
    setLoading(true);
    setFeedback('');
    try {
      const result: PuzzleResult = await PuzzleService.submitAnswerPuzzleAnswerPost({
        puzzle_id: puzzle.id,
        answer,
      });
      if (result.correct) {
        setFeedback('Correct!');
      } else {
        setFeedback('Incorrect.');
      }
      setAnswer('');
      // Refetch puzzle (next or same)
      await fetchPuzzle();
    } catch (err) {
      setFeedback('Failed to submit answer.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if it's the user's turn (active puzzle assigned to them)
  const isMyTurn = !!puzzle && !isEliminated && !gameOver;

  // Show loading state while waiting for WebSocket data
  if (!wsConnected) {
    return (
      <div className="game-session-container">
        <h2>Game Session</h2>
        <div className="loading-message">Connecting to game...</div>
      </div>
    );
  }

  // UI for eliminated player
  if (isEliminated && !gameOver) {
    return (
      <div className="game-session-container">
        <h2>Game Session</h2>
        <div className="eliminated-message">You have been eliminated.</div>
        <div>Thank you for playing! Please wait for the game to finish.</div>
        {/* Show team points and events for spectatorship */}
        <hr />
        <h4>Team Points</h4>
        <table className="team-points-table">
          <thead>
            <tr><th>Player</th><th>Points</th></tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className={p.id === user.id ? 'current-user' : ''}>
                <td>{p.username}</td>
                <td>{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length > 0 && (
          <div className="game-events-section">
            <h4>Game Events</h4>
            <ul className="game-events-list">
              {notifications.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // UI for game over
  if (gameOver) {
    return (
      <div className="game-session-container">
        <h2>Game Over</h2>
        <div className="final-standings-title">Final Standings</div>
        <table className="team-points-table">
          <thead>
            <tr><th>Player</th><th>Points</th></tr>
          </thead>
          <tbody>
            {finalStandings.map(p => (
              <tr key={p.id} className={p.id === user.id ? 'current-user' : ''}>
                <td>{p.username}</td>
                <td>{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="return-to-lobby-button-container">
          <button onClick={() => {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('teamId');
            window.location.reload();
          }}>Return to Lobby</button>
        </div>
      </div>
    );
  }

  // UI for waiting for turn
  if (!isMyTurn && !isEliminated && !gameOver) {
    return (
      <div className="game-session-container">
        <h2>Game Session</h2>
        <div className="waiting-message">Waiting for your turn...</div>
        <div>Watch your teammates and get ready!</div>
        <hr />
        <h4>Team Points</h4>
        <table className="team-points-table">
          <thead>
            <tr><th>Player</th><th>Points</th></tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className={p.id === user.id ? 'current-user' : ''}>
                <td>{p.username}</td>
                <td>{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length > 0 && (
          <div className="game-events-section">
            <h4>Game Events</h4>
            <ul className="game-events-list">
              {notifications.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="game-session-container">
      <h2>Game Session</h2>
      <div>Team: <b>{team.name}</b></div>
      <div>You are: <b>{user.username}</b></div>
      <div>Session ID: {session.id}</div>
      <hr />
      <div className="team-points-section">
        <h4>Team Points</h4>
        <table className="team-points-table">
          <thead>
            <tr><th>Player</th><th>Points</th></tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className={p.id === user.id ? 'current-user' : ''}>
                <td>{p.username}</td>
                <td>{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notifications.length > 0 && (
        <div className="game-events-section">
          <h4>Game Events</h4>
          <ul className="game-events-list">
            {notifications.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
      <hr />
      {loading && <div className="loading-spinner"></div>}
      {error && <div className="error-message">{error}</div>}
      {puzzle && (
        <div className="puzzle-section">
          <h3>Puzzle: {puzzle.type}</h3>
          <pre className="puzzle-data-pre">{JSON.stringify(puzzle.data, null, 2)}</pre>
          <form onSubmit={handleSubmit} className="puzzle-input-form">
            <input
              type="text"
              placeholder="Your answer"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={loading}
              className="puzzle-input-field"
              aria-label="Your answer input"
              tabIndex={0}
            />
            <button type="submit" disabled={loading || !answer} className="submit-button" aria-label="Submit answer">Submit</button>
          </form>
          {feedback && <div className={`feedback-message ${feedback === 'Correct!' ? 'correct' : 'incorrect'}`}>{feedback}</div>}
        </div>
      )}
    </div>
  );
};

export default GameSessionView; 