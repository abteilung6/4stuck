import React from 'react';
import { Container, Card, SectionTitle, Button, List, StatusMessage } from './design-system';
import type { GameStatusInfo, Player } from '../types/game';

interface GameResultsViewProps {
  gameStatus: GameStatusInfo;
  user: any;
  onPlayAgain?: () => void;
  onReturnToLobby?: () => void;
}

const GameResultsView: React.FC<GameResultsViewProps> = ({ 
  gameStatus, 
  user, 
  onPlayAgain,
  onReturnToLobby 
}) => {
  const handlePlayAgain = () => {
    if (onPlayAgain) {
      onPlayAgain();
    } else {
      // Default behavior: reload the page to return to lobby
      window.location.reload();
    }
  };

  const handleReturnToLobby = () => {
    if (onReturnToLobby) {
      onReturnToLobby();
    } else {
      // Default behavior: reload the page to return to lobby
      window.location.reload();
    }
  };

  return (
    <Container variant="full" dataTestId="game-results-container">
      <Card style={{ background: '#fff', margin: '1em 0', padding: '2em' }}>
        <SectionTitle level={2}>Game Results</SectionTitle>
        
        {/* Team Survival Time */}
        <div style={{ textAlign: 'center', marginBottom: '2em' }}>
          <SectionTitle level={3} style={{ color: '#1976d2', marginBottom: '0.5em' }}>
            Team Survival Time
          </SectionTitle>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b6b' }}>
            {/* TODO: Get actual survival time from game state */}
            00:00
          </div>
          <p style={{ color: '#666', marginTop: '0.5em' }}>
            Your team survived for this long!
          </p>
        </div>

        {/* Final Standings */}
        <div style={{ marginBottom: '2em' }}>
          <SectionTitle level={3}>Final Standings</SectionTitle>
          <List aria-label="Final standings">
            {gameStatus.finalStandings.map((player, index) => (
              <List.Item 
                key={player.id} 
                className={player.id === user.id ? 'current-user' : ''}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75em 0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    marginRight: '0.5em',
                    color: index === 0 ? '#ffd700' : '#666'
                  }}>
                    #{index + 1}
                  </span>
                  <span className="ds-list-item__name">{player.username}</span>
                  {player.id === user.id && (
                    <span style={{ marginLeft: '0.5em', color: '#1976d2', fontSize: '0.9em' }}>
                      (You)
                    </span>
                  )}
                </div>
                <span style={{ 
                  color: '#1976d2', 
                  fontWeight: 600, 
                  fontSize: '1.1rem'
                }}>
                  {player.points} pts
                </span>
              </List.Item>
            ))}
          </List>
        </div>

        {/* Individual Statistics */}
        <div style={{ marginBottom: '2em' }}>
          <SectionTitle level={3}>Your Performance</SectionTitle>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1em',
            marginTop: '1em'
          }}>
            <Card style={{ padding: '1em', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
                {/* TODO: Get actual puzzles solved count */}
                0
              </div>
              <div style={{ color: '#666' }}>Puzzles Solved</div>
            </Card>
            <Card style={{ padding: '1em', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                {/* TODO: Get actual points given count */}
                0
              </div>
              <div style={{ color: '#666' }}>Points Given</div>
            </Card>
            <Card style={{ padding: '1em', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3' }}>
                {/* TODO: Get actual points received count */}
                0
              </div>
              <div style={{ color: '#666' }}>Points Received</div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1em', 
          justifyContent: 'center',
          marginTop: '2em'
        }}>
          <Button 
            onClick={handlePlayAgain} 
            variant="primary"
            aria-label="Play Again"
          >
            Play Again
          </Button>
          <Button 
            onClick={handleReturnToLobby} 
            variant="secondary"
            aria-label="Return to Lobby"
          >
            Return to Lobby
          </Button>
        </div>

        {/* Motivational Message */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2em', 
          padding: '1em',
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid #4caf50',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#4caf50', fontWeight: 'bold', margin: 0 }}>
            Great teamwork! Every puzzle solved helped your team survive longer.
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default GameResultsView; 