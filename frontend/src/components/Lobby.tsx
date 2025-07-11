import React, { useState, useEffect } from 'react';
import { TeamService } from '../api/services/TeamService';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import type { TeamCreate } from '../api/models/TeamCreate';
import type { UserOut } from '../api/models/UserOut';
import { GameService } from '../api/services/GameService';
import type { GameSessionOut } from '../api/models/GameSessionOut';
import GameSessionView from './GameSessionView';
import { useRef } from 'react';

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
  const [session, setSession] = useState<GameSessionOut | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const isFirstLoad = useRef(true);

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

  // Fetch current session for the team
  const fetchSession = async (teamId: number) => {
    setSessionLoading(true);
    try {
      const sess = await GameService.getCurrentSessionGameSessionTeamIdGet(teamId);
      setSession(sess);
    } catch (err) {
      setSession(null); // No active session
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line
  }, [currentName]);

  // When currentTeam changes, check for active session
  useEffect(() => {
    if (currentTeam) {
      fetchSession(currentTeam.id);
    } else {
      setSession(null);
    }
    // eslint-disable-next-line
  }, [currentTeam]);

  // Load persisted state on mount
  useEffect(() => {
    if (isFirstLoad.current) {
      const savedName = localStorage.getItem('username');
      const savedTeamId = localStorage.getItem('teamId');
      const savedSessionId = localStorage.getItem('sessionId');
      if (savedName) setCurrentName(savedName);
      if (savedName) setUsername(savedName);
      if (savedTeamId) {
        // Will be set after teams are fetched
      }
      if (savedSessionId) {
        setSession({ id: Number(savedSessionId), team_id: savedTeamId ? Number(savedTeamId) : undefined, status: 'active' } as any);
      }
      isFirstLoad.current = false;
    }
  }, []);

  // Persist state on change
  useEffect(() => {
    if (currentName) localStorage.setItem('username', currentName);
  }, [currentName]);
  useEffect(() => {
    if (currentTeam) localStorage.setItem('teamId', String(currentTeam.id));
  }, [currentTeam]);
  useEffect(() => {
    if (session) localStorage.setItem('sessionId', String(session.id));
    else localStorage.removeItem('sessionId');
  }, [session]);

  // After teams are fetched, restore currentTeam if needed
  useEffect(() => {
    const savedTeamId = localStorage.getItem('teamId');
    if (savedTeamId && teams.length > 0 && !currentTeam) {
      const found = teams.find(t => String(t.id) === savedTeamId);
      if (found) setCurrentTeam(found);
    }
    // eslint-disable-next-line
  }, [teams]);

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

  const handleStartGame = async () => {
    if (!currentTeam) return;
    setSessionLoading(true);
    setStatus('Starting game session...');
    try {
      const sess = await GameService.createGameSessionGameSessionPost({ team_id: currentTeam.id });
      setSession(sess);
      setStatus('Game session started!');
    } catch (err: any) {
      setStatus('Failed to start game session. There may already be an active session.');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleLeaveTeam = () => {
    setCurrentTeam(null);
    setStatus('You left the team. (Reload to re-sync)');
    // Note: No backend endpoint for leaving a team; would need to implement.
  };

  // Find the current user object from the team members
  const currentUser = currentTeam?.members.find(m => m.username === currentName) || null;

  // If a session is active, show the game session view
  if (session && currentTeam && currentUser) {
    return <GameSessionView session={session} user={currentUser} team={currentTeam} />;
  }

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
          <button
            onClick={handleStartGame}
            disabled={sessionLoading || !!session}
            style={{ marginRight: 8 }}
          >
            {sessionLoading ? 'Starting...' : session ? 'Game In Progress' : 'Start Game'}
          </button>
          {session && (
            <div style={{ marginTop: 8, color: 'green' }}>
              Game session active! (Session ID: {session.id})
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 24, minHeight: 24, color: '#b00' }}>{status}</div>
      <button
        onClick={() => {
          localStorage.removeItem('sessionId');
          localStorage.removeItem('teamId');
          setTimeout(() => window.location.reload(), 100); // 100ms delay
        }}
      >
        Return to Lobby
      </button>
    </div>
  );
};

export default Lobby; 