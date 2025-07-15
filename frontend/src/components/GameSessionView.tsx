import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import type { GameSessionOut } from '../api/models/GameSessionOut';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import './GameSessionView.css';
import { PuzzleRenderer } from './puzzles/PuzzleRenderer';
import Card from './design-system/Card';
import Container from './design-system/Container';
import SectionTitle from './design-system/SectionTitle';
import Button from './design-system/Button';
import StatusMessage from './design-system/StatusMessage';
import List from './design-system/List';
import './design-system/Card.css';
import './design-system/List.css';
import CountdownView from './CountdownView';
import './CountdownView.css';
import GameResultsView from './GameResultsView';

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
      <Container variant="full" dataTestId="game-session-container">
        <SectionTitle level={2}>Game Session</SectionTitle>
        <StatusMessage type="info">Connecting to game...</StatusMessage>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container variant="full" dataTestId="game-session-container">
        <SectionTitle level={2}>Game Session</SectionTitle>
        <StatusMessage type="error">Error: {error}</StatusMessage>
      </Container>
    );
  }

  // Show countdown state
  if (gameStatus?.status === 'countdown') {
    return <CountdownView onCountdownComplete={() => {}} initialCountdown={5} />;
  }

  // Show game over state
  if (gameStatus?.status === 'gameOver') {
    return <GameResultsView gameStatus={gameStatus} user={user} />;
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
    <Container variant="full" dataTestId="game-session-container">
      <SectionTitle level={2}>Game Session</SectionTitle>
      <div className="loading-message">Loading game...</div>
    </Container>
  );
};

// Separate UI components for different game states
const GameOverView: React.FC<{ gameStatus: any; user: any }> = ({ gameStatus, user }) => (
  <Container variant="full" dataTestId="game-session-container">
    <SectionTitle level={2}>Game Over</SectionTitle>
    <SectionTitle level={3}>Final Standings</SectionTitle>
    <List aria-label="Final standings">
      {gameStatus.finalStandings.map((p: any) => (
        <List.Item key={p.id} className={p.id === user.id ? 'current-user' : ''}>
          <span className="ds-list-item__name">{p.username}</span>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>{p.points}</span>
        </List.Item>
      ))}
    </List>
    <Button onClick={() => window.location.reload()} variant="secondary" style={{ marginTop: 24 }} aria-label="Return to Lobby">
      Return to Lobby
    </Button>
  </Container>
);

const EliminatedView: React.FC<{ gameState: any; user: any; notifications: string[] }> = ({ 
  gameState, 
  user, 
  notifications 
}) => (
  <Container variant="full" dataTestId="game-session-container">
    <SectionTitle level={2}>Game Session</SectionTitle>
    <StatusMessage type="error">You have been eliminated.</StatusMessage>
    <div>Thank you for playing! Please wait for the game to finish.</div>
    <SectionTitle level={3} style={{ marginTop: 16 }}>Team Points</SectionTitle>
    <List aria-label="Team points">
      {gameState?.players?.map((p: any) => (
        <List.Item key={p.id} className={p.id === user.id ? 'current-user' : ''}>
          <span className="ds-list-item__name">{p.username}</span>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>{p.points}</span>
        </List.Item>
      ))}
    </List>
    {notifications.length > 0 && (
      <Card style={{ background: '#fff', margin: '1em 0', padding: '1em 1.5em' }}>
        <SectionTitle level={3}>Game Events</SectionTitle>
        <List aria-label="Game events">
          {notifications.map((n, i) => <List.Item key={i}>{n}</List.Item>)}
        </List>
      </Card>
    )}
    <Button onClick={() => window.location.reload()} variant="secondary" style={{ marginTop: 24 }} aria-label="Return to Lobby">
      Return to Lobby
    </Button>
  </Container>
);

const WaitingView: React.FC<{ gameState: any; user: any }> = ({ gameState, user }) => (
  <Container variant="full" dataTestId="game-session-container">
    <SectionTitle level={2}>Game Session</SectionTitle>
    <StatusMessage type="info">Waiting for your turn...</StatusMessage>
    <div>Watch your teammates and get ready!</div>
    <SectionTitle level={3} style={{ marginTop: 16 }}>Team Points</SectionTitle>
    <List aria-label="Team points">
      {gameState?.players?.map((p: any) => (
        <List.Item key={p.id} className={p.id === user.id ? 'current-user' : ''}>
          <span className="ds-list-item__name">{p.username}</span>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>{p.points}</span>
        </List.Item>
      ))}
    </List>
    <Button onClick={() => window.location.reload()} variant="secondary" style={{ marginTop: 24 }} aria-label="Return to Lobby">
      Return to Lobby
    </Button>
  </Container>
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
  return (
    <Container variant="full" dataTestId="game-session-container">
      <SectionTitle level={2}>Game Session</SectionTitle>
      <Card style={{ background: '#fff', margin: '1em 0', padding: '1em 1.5em' }}>
        <SectionTitle level={3}>Your Puzzle</SectionTitle>
        <PuzzleRenderer
          puzzle={puzzle}
          answer={answer}
          setAnswer={setAnswer}
          submitAnswer={submitAnswer}
          loading={loading}
          feedback={feedback}
        />
        {feedback && <StatusMessage type={feedback === 'Correct!' ? 'success' : 'error'}>{feedback}</StatusMessage>}
      </Card>
      <SectionTitle level={3}>Team Points</SectionTitle>
      <List aria-label="Team points">
        {gameState?.players?.map((p: any) => (
          <List.Item key={p.id} className={p.id === user.id ? 'current-user' : ''}>
            <span className="ds-list-item__name">{p.username}</span>
            <span style={{ color: '#1976d2', fontWeight: 600 }}>{p.points}</span>
          </List.Item>
        ))}
      </List>
    </Container>
  );
};

export default GameSessionView; 