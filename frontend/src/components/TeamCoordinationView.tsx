import React, { useState, useEffect } from 'react';
import Card from './design-system/Card';
import SectionTitle from './design-system/SectionTitle';
import List from './design-system/List';
import StatusMessage from './design-system/StatusMessage';
import './TeamCoordinationView.css';

interface Player {
  id: number;
  username: string;
  points: number;
  activity?: any;
  mouse_position?: any;
}

interface TeamCoordinationViewProps {
  players: Player[];
  currentUserId: number;
  notifications: string[];
}

interface PointTransfer {
  id: string;
  fromPlayer: string;
  toPlayer: string;
  points: number;
  timestamp: Date;
  type: 'puzzle_solved' | 'point_decay' | 'elimination';
}

const TeamCoordinationView: React.FC<TeamCoordinationViewProps> = ({
  players,
  currentUserId,
  notifications
}) => {
  const [pointTransfers, setPointTransfers] = useState<PointTransfer[]>([]);
  const [lastPointUpdate, setLastPointUpdate] = useState<{[key: number]: number}>({});

  // Track point changes to detect transfers
  useEffect(() => {
    const newTransfers: PointTransfer[] = [];

    players.forEach(player => {
      const lastPoints = lastPointUpdate[player.id] || 15; // Default starting points
      const currentPoints = player.points;

      if (currentPoints !== lastPoints) {
        const pointDiff = currentPoints - lastPoints;

        if (pointDiff > 0) {
          // Player gained points - find who might have given them
          const potentialGivers = players.filter(p =>
            p.id !== player.id &&
            (lastPointUpdate[p.id] || 15) > p.points
          );

          if (potentialGivers.length > 0) {
            // Assume the first potential giver (could be enhanced with more logic)
            const giver = potentialGivers[0];
            const transfer: PointTransfer = {
              id: `${Date.now()}-${player.id}`,
              fromPlayer: giver.username,
              toPlayer: player.username,
              points: pointDiff,
              timestamp: new Date(),
              type: 'puzzle_solved'
            };
            newTransfers.push(transfer);
          }
        } else if (pointDiff < 0) {
          // Player lost points - could be decay or elimination
          const transfer: PointTransfer = {
            id: `${Date.now()}-${player.id}`,
            fromPlayer: player.username,
            toPlayer: 'System',
            points: Math.abs(pointDiff),
            timestamp: new Date(),
            type: pointDiff === -1 ? 'point_decay' : 'elimination'
          };
          newTransfers.push(transfer);
        }
      }
    });

    if (newTransfers.length > 0) {
      setPointTransfers(prev => [...newTransfers, ...prev.slice(0, 9)]); // Keep last 10 transfers
    }

    // Update last known points
    const newLastPoints: {[key: number]: number} = {};
    players.forEach(player => {
      newLastPoints[player.id] = player.points;
    });
    setLastPointUpdate(newLastPoints);
  }, [players]);

  const getPlayerStatus = (player: Player) => {
    if (player.points <= 0) return 'eliminated';
    if (player.activity?.is_active) return 'active';
    if (player.activity?.is_thinking) return 'thinking';
    return 'waiting';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eliminated': return '#d32f2f';
      case 'active': return '#2e7d32';
      case 'thinking': return '#f57c00';
      case 'waiting': return '#666';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'eliminated': return '💀';
      case 'active': return '🎯';
      case 'thinking': return '🤔';
      case 'waiting': return '⏳';
      default: return '⏳';
    }
  };

  const getPuzzleTypeIcon = (puzzleType?: string) => {
    switch (puzzleType) {
      case 'memory': return '🧠';
      case 'spatial': return '🎯';
      case 'concentration': return '👁️';
      case 'multitasking': return '⚡';
      default: return '❓';
    }
  };

  return (
    <div className="team-coordination-container">
      {/* Team Status Overview */}
      <Card className="team-status-card">
        <SectionTitle level={3}>Team Status</SectionTitle>
        <div className="team-status-grid">
          {players.map(player => {
            const status = getPlayerStatus(player);
            const isCurrentUser = player.id === currentUserId;

            return (
              <div
                key={player.id}
                className={`player-status-item ${isCurrentUser ? 'current-user' : ''} ${status}`}
              >
                <div className="player-status-header">
                  <span className="player-name">{player.username}</span>
                  <span className="status-icon">{getStatusIcon(status)}</span>
                </div>
                <div className="player-points">
                  <span className="points-value">{player.points}</span>
                  <span className="points-label">points</span>
                </div>
                <div className="player-activity">
                  {player.activity?.puzzle_type && (
                    <span className="puzzle-type">
                      {getPuzzleTypeIcon(player.activity.puzzle_type)} {player.activity.puzzle_type}
                    </span>
                  )}
                  {player.activity?.progress && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${player.activity.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                {status === 'eliminated' && (
                  <div className="eliminated-badge">ELIMINATED</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Point Transfer History */}
      {pointTransfers.length > 0 && (
        <Card className="point-transfers-card">
          <SectionTitle level={3}>Recent Activity</SectionTitle>
          <div className="point-transfers-list">
            {pointTransfers.slice(0, 5).map(transfer => (
              <div key={transfer.id} className={`point-transfer-item ${transfer.type}`}>
                <div className="transfer-icon">
                  {transfer.type === 'puzzle_solved' && '🎯'}
                  {transfer.type === 'point_decay' && '⏰'}
                  {transfer.type === 'elimination' && '💀'}
                </div>
                <div className="transfer-details">
                  <div className="transfer-text">
                    {transfer.type === 'puzzle_solved' && (
                      <span>
                        <strong>{transfer.fromPlayer}</strong> solved puzzle →
                        <strong> {transfer.toPlayer}</strong> +{transfer.points} points
                      </span>
                    )}
                    {transfer.type === 'point_decay' && (
                      <span>
                        <strong>{transfer.fromPlayer}</strong> lost {transfer.points} point (decay)
                      </span>
                    )}
                    {transfer.type === 'elimination' && (
                      <span>
                        <strong>{transfer.fromPlayer}</strong> eliminated (-{transfer.points} points)
                      </span>
                    )}
                  </div>
                  <div className="transfer-time">
                    {transfer.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Notifications */}
      {notifications.length > 0 && (
        <Card className="notifications-card">
          <SectionTitle level={3}>Team Events</SectionTitle>
          <List aria-label="Team events">
            {notifications.slice(0, 3).map((notification, index) => (
              <List.Item key={index} className="notification-item">
                {notification}
              </List.Item>
            ))}
          </List>
        </Card>
      )}
    </div>
  );
};

export default TeamCoordinationView;
