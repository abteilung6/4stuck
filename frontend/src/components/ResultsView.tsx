import React from 'react';
import './ResultsView.css';

interface PlayerResult {
  id: number;
  username: string;
  finalPoints: number;
  puzzlesSolved: number;
  survivalTime: number;
}

interface TeamResult {
  teamName: string;
  survivalTimeSeconds: number;
  players: PlayerResult[];
}

interface ResultsViewProps {
  teamResult: TeamResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  teamResult,
  onPlayAgain,
  onBackToLobby
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSurvivalMessage = (time: number): string => {
    if (time < 60) return "Short survival - room for improvement!";
    if (time < 180) return "Good effort - you're getting the hang of it!";
    if (time < 300) return "Excellent survival time - well done!";
    return "Outstanding performance - you're a survival expert!";
  };

  const getPerformanceColor = (time: number): string => {
    if (time < 60) return "#ff6b6b";
    if (time < 180) return "#ffd93d";
    if (time < 300) return "#6bcf7f";
    return "#4a90e2";
  };

  return (
    <div className="results-container">
      <div className="results-content">
        <h1 className="results-title">MISSION RESULTS</h1>

        <div className="survival-summary">
          <div className="survival-time">
            <h2>Survival Time</h2>
            <div
              className="time-display"
              style={{ color: getPerformanceColor(teamResult.survivalTimeSeconds) }}
            >
              {formatTime(teamResult.survivalTimeSeconds)}
            </div>
            <p className="survival-message">
              {getSurvivalMessage(teamResult.survivalTimeSeconds)}
            </p>
          </div>
        </div>

        <div className="team-performance">
          <h2>Team Performance</h2>
          <div className="team-name">{teamResult.teamName}</div>

          <div className="players-grid">
            {teamResult.players.map((player, index) => (
              <div key={player.id} className="player-result">
                <div className="player-header">
                  <span className="player-number">#{index + 1}</span>
                  <span className="player-name">{player.username}</span>
                </div>
                <div className="player-stats">
                  <div className="stat">
                    <span className="stat-label">Final Points:</span>
                    <span className="stat-value">{player.finalPoints}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Puzzles Solved:</span>
                    <span className="stat-value">{player.puzzlesSolved}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Survival:</span>
                    <span className="stat-value">{formatTime(player.survivalTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button
            className="action-button play-again"
            onClick={onPlayAgain}
          >
            PLAY AGAIN
          </button>
          <button
            className="action-button back-lobby"
            onClick={onBackToLobby}
          >
            BACK TO LOBBY
          </button>
        </div>

        <div className="results-motivation">
          <p>"The strength of the team is each individual member. The strength of each member is the team."</p>
          <p>- Phil Jackson</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
