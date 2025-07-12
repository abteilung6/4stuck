import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import type { GameSessionOut } from '../api/models/GameSessionOut';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import './GameSessionView.css';

interface GameSessionViewProps {
  session: GameSessionOut;
  user: { id: number; username: string };
  team: TeamWithMembersOut;
}

const GameSessionView: React.FC<GameSessionViewProps> = ({ session, user, team }) => {
  const {
    gameState,
    puzzle,
    gameStatus,
    answer,
    feedback,
    loading,
    error,
    notifications,
    setAnswer,
    submitAnswer,
    isConnected
  } = useGameLogic({
    sessionId: session.id,
    userId: user.id,
    initialTeam: team
  });

  // Show loading state while waiting for WebSocket data
  if (!isConnected) {
    return (
      <div className="game-session-container">
        <h2>Game Session</h2>
        <div className="loading-message">Connecting to game...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="game-session-container">
        <h2>Game Session</h2>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  // Show game over state
  if (gameStatus?.status === 'gameOver') {
    return <GameOverView gameStatus={gameStatus} user={user} />;
  }

  // Show eliminated state
  if (gameStatus?.status === 'eliminated') {
    return <EliminatedView gameState={gameState} user={user} notifications={notifications} />;
  }

  // Show waiting state
  if (gameStatus?.status === 'waiting') {
    return <WaitingView gameState={gameState} user={user} />;
  }

  // Show active game state
  if (gameStatus?.status === 'active') {
    return (
      <ActiveGameView
        puzzle={puzzle}
        answer={answer}
        feedback={feedback}
        loading={loading}
        gameState={gameState}
        user={user}
        setAnswer={setAnswer}
        submitAnswer={submitAnswer}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="game-session-container">
      <h2>Game Session</h2>
      <div className="loading-message">Loading game...</div>
    </div>
  );
};

// Separate UI components for different game states
const GameOverView: React.FC<{ gameStatus: any; user: any }> = ({ gameStatus, user }) => (
  <div className="game-session-container">
    <h2>Game Over</h2>
    <div className="final-standings-title">Final Standings</div>
    <table className="team-points-table">
      <thead>
        <tr><th>Player</th><th>Points</th></tr>
      </thead>
      <tbody>
        {gameStatus.finalStandings.map((p: any) => (
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

const EliminatedView: React.FC<{ gameState: any; user: any; notifications: string[] }> = ({ 
  gameState, 
  user, 
  notifications 
}) => (
  <div className="game-session-container">
    <h2>Game Session</h2>
    <div className="eliminated-message">You have been eliminated.</div>
    <div>Thank you for playing! Please wait for the game to finish.</div>
    <hr />
    <h4>Team Points</h4>
    <table className="team-points-table">
      <thead>
        <tr><th>Player</th><th>Points</th></tr>
      </thead>
      <tbody>
        {gameState?.players?.map((p: any) => (
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

const WaitingView: React.FC<{ gameState: any; user: any }> = ({ gameState, user }) => (
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
        {gameState?.players?.map((p: any) => (
          <tr key={p.id} className={p.id === user.id ? 'current-user' : ''}>
            <td>{p.username}</td>
            <td>{p.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ActiveGameView: React.FC<{
  puzzle: any;
  answer: string;
  feedback: string;
  loading: boolean;
  gameState: any;
  user: any;
  setAnswer: (answer: string) => void;
  submitAnswer: () => Promise<void>;
}> = ({ puzzle, answer, feedback, loading, gameState, user, setAnswer, submitAnswer }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };

  return (
    <div className="game-session-container">
      <h2>Game Session</h2>
      <div className="puzzle-section">
        <h3>Your Puzzle</h3>
        {puzzle ? (
          <div className="puzzle-content">
            <p><strong>Type:</strong> {puzzle.type}</p>
            <p><strong>Question:</strong> {puzzle.data?.question || 'No question available'}</p>
            <form onSubmit={handleSubmit} className="answer-form">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                disabled={loading}
                className="answer-input"
              />
              <button type="submit" disabled={loading || !answer.trim()} className="submit-button">
                {loading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
            {feedback && (
              <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
                {feedback}
              </div>
            )}
          </div>
        ) : (
          <p>No puzzle available.</p>
        )}
      </div>
      <hr />
      <h4>Team Points</h4>
      <table className="team-points-table">
        <thead>
          <tr><th>Player</th><th>Points</th></tr>
        </thead>
        <tbody>
          {gameState?.players?.map((p: any) => (
            <tr key={p.id} className={p.id === user.id ? 'current-user' : ''}>
              <td>{p.username}</td>
              <td>{p.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameSessionView; 