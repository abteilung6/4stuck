import React, { useState, useEffect } from 'react';
import { TeamService } from '../api/services/TeamService';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import type { TeamCreate } from '../api/models/TeamCreate';
import type { UserOut } from '../api/models/UserOut';

export const Lobby: React.FC = () => {
  const [username, setUsername] = useState('');
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamWithMembersOut[]>([]);
  const [currentTeam, setCurrentTeam] = useState<TeamWithMembersOut | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [creatingTeam, setCreatingTeam] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');

  // Fetch teams from backend
  const fetchTeams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await TeamService.listTeamsTeamGet();
      setTeams(data);
      // If user is already in a team, update currentTeam
      if (currentName) {
        const found = data.find(team => team.members.some(m => m.username === currentName));
        setCurrentTeam(found || null);
      }
    } catch (err) {
      setError('Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line
  }, [currentName]);

  const handleSetName = async () => {
    if (username.trim()) {
      setCurrentName(username.trim());
      setStatus('');
      // Register user with backend
      try {
        await TeamService.registerUserTeamRegisterPost({ username: username.trim() });
      } catch (err: any) {
        // If user already exists, ignore error
        if (err?.response?.status !== 400) {
          setStatus('Failed to register user.');
        }
      }
    } else {
      setStatus('Please enter a username.');
    }
  };

  const handleJoinTeam = async (team: TeamWithMembersOut) => {
    if (!currentName) {
      setStatus('Set your username first.');
      return;
    }
    setStatus('Joining team...');
    try {
      await TeamService.joinTeamTeamJoinPost(currentName, team.id);
      setStatus(`Joined ${team.name}`);
      await fetchTeams();
    } catch (err: any) {
      setStatus('Failed to join team.');
    }
  };

  const handleCreateTeam = async () => {
    if (!currentName) {
      setStatus('Set your username first.');
      return;
    }
    if (!newTeamName.trim()) {
      setStatus('Enter a team name.');
      return;
    }
    setCreatingTeam(true);
    setStatus('Creating team...');
    try {
      const created = await TeamService.createTeamTeamCreatePost({ name: newTeamName } as TeamCreate);
      setStatus(`Created team ${created.name}`);
      setNewTeamName('');
      await fetchTeams();
      // Auto-join the new team
      await handleJoinTeam(created as TeamWithMembersOut);
    } catch (err: any) {
      setStatus('Failed to create team. Name may already exist.');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleLeaveTeam = () => {
    setCurrentTeam(null);
    setStatus('You left the team. (Reload to re-sync)');
    // Note: No backend endpoint for leaving a team; would need to implement.
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
      {loading ? (
        <div>Loading teams...</div>
      ) : error ? (
        <div style={{ color: '#b00' }}>{error}</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {teams.map(team => (
            <li key={team.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{team.name} &nbsp;|&nbsp; {team.members.length} members</span>
              <button onClick={() => handleJoinTeam(team)} disabled={!!currentTeam && currentTeam.id === team.id || !currentName}>
                Join
              </button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 8 }}>
        <input
          type="text"
          placeholder="New team name"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          disabled={creatingTeam}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleCreateTeam} disabled={creatingTeam || !currentName}>
          + Create New Team
        </button>
      </div>
      <hr />
      {currentTeam && (
        <div>
          <h3>Your Team: {currentTeam.name}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentTeam.members.map((member) => (
              <li key={member.id}>{member.username}</li>
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