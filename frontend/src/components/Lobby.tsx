import React, { useState } from 'react';

// Placeholder types for teams and members
type Team = {
  id: string;
  name: string;
  members: string[];
};

const mockTeams: Team[] = [
  { id: '1', name: 'Team Alpha', members: ['Alice', 'Bob', 'Charlie'] },
  { id: '2', name: 'Team Bravo', members: ['You', 'Alice', 'Bob'] },
  { id: '3', name: 'Team Charlie', members: ['Dave', 'Eve', 'Frank', 'Grace'] },
];

export const Lobby: React.FC = () => {
  const [username, setUsername] = useState('');
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [teams] = useState<Team[]>(mockTeams);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleSetName = () => {
    if (username.trim()) {
      setCurrentName(username.trim());
      setStatus('');
    } else {
      setStatus('Please enter a username.');
    }
  };

  const handleJoinTeam = (team: Team) => {
    setCurrentTeam(team);
    setStatus(`Joined ${team.name}`);
  };

  const handleCreateTeam = () => {
    setStatus('Create team functionality coming soon.');
  };

  const handleLeaveTeam = () => {
    setCurrentTeam(null);
    setStatus('You left the team.');
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Game Lobby</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={!!currentName}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleSetName} disabled={!!currentName}>
          Set Name
        </button>
        {currentName && <span style={{ marginLeft: 16 }}>Hello, <b>{currentName}</b>!</span>}
      </div>
      <hr />
      <h3>Available Teams:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {teams.map(team => (
          <li key={team.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1 }}>{team.name} &nbsp;|&nbsp; {team.members.length} members</span>
            <button onClick={() => handleJoinTeam(team)} disabled={!!currentTeam && currentTeam.id === team.id}>
              Join
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleCreateTeam} style={{ marginTop: 8 }}>
        + Create New Team
      </button>
      <hr />
      {currentTeam && (
        <div>
          <h3>Your Team: {currentTeam.name}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentTeam.members.map((member, idx) => (
              <li key={idx}>{member}</li>
            ))}
          </ul>
          <button onClick={handleLeaveTeam} style={{ marginRight: 8 }}>
            Leave Team
          </button>
          <button disabled>Ready/Start Game</button>
        </div>
      )}
      <div style={{ marginTop: 24, minHeight: 24, color: '#b00' }}>{status}</div>
    </div>
  );
};

export default Lobby; 