import React, { useState, useEffect } from 'react';
import { TeamService } from '../api/services/TeamService';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import type { AvailableTeamOut } from '../api/models/AvailableTeamOut';
import type { TeamCreate } from '../api/models/TeamCreate';
import type { UserOut } from '../api/models/UserOut';
import type { TeamOut } from '../api/models/TeamOut';
import { GameService } from '../api/services/GameService';
import type { GameSessionOut } from '../api/models/GameSessionOut';
import GameSessionView from './GameSessionView';
import { useRef } from 'react';
import './Lobby.css'; // Add a CSS file for styles
import Button from './design-system/Button';
import Input from './design-system/Input';
import Card from './design-system/Card';
import Container from './design-system/Container';
import StatusMessage from './design-system/StatusMessage';
import SectionTitle from './design-system/SectionTitle';
import List from './design-system/List';
import './design-system/List.css';

const Lobby: React.FC = () => {
  const [teams, setTeams] = useState<AvailableTeamOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [currentTeam, setCurrentTeam] = useState<AvailableTeamOut | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [session, setSession] = useState<GameSessionOut | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [status, setStatus] = useState('');
  const isFirstLoad = useRef(true);

  const fetchTeams = async () => {
    try {
      const data = await TeamService.getAvailableTeamsTeamAvailableGet();
      setTeams(data);
    } catch (err) {
      setError('Failed to fetch available teams.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async (teamId: number) => {
    try {
      const data = await GameService.getCurrentSessionGameSessionTeamIdGet(teamId);
      setSession(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setSession(null);
      } else {
        setError('Failed to fetch session.');
      }
    }
  };

  // Fetch teams on mount and clear session
  useEffect(() => {
    setSession(null); // Clear any existing session on mount
    fetchTeams();
  }, []);

  // Fetch session when team changes
  useEffect(() => {
    if (currentTeam) {
      fetchSession(currentTeam.id);
    }
    // eslint-disable-next-line
  }, [currentTeam]);

  // Poll session state every second if in a team but not yet in a session
  useEffect(() => {
    if (!currentTeam || session) return;
    let interval: NodeJS.Timeout | null = null;
    let cancelled = false;
    interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const data = await GameService.getCurrentSessionGameSessionTeamIdGet(currentTeam.id);
        // If session exists and is not in 'lobby', set it and transition
        if (data && data.status && data.status !== 'lobby') {
          setSession(data);
        }
      } catch (err: any) {
        // Ignore 404 (no session yet)
      }
    }, 1000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [currentTeam, session]);

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

  const handleJoinTeam = async (team: AvailableTeamOut) => {
    if (!currentName) {
      setStatus('Set your username first.');
      return;
    }
    setStatus('Joining team...');
    try {
      // Get the updated user object with color from the join endpoint
      const joinedUser = await TeamService.joinTeamTeamJoinPost(currentName, team.id);
      setStatus(`Joined ${team.name}`);
      
      // Fetch updated teams and set currentTeam to the fresh data
      await fetchTeams();
      const updatedTeams = await TeamService.getAvailableTeamsTeamAvailableGet();
      const updatedTeam = updatedTeams.find(t => t.id === team.id);
      if (updatedTeam) {
        // Patch the current user in the team with the color from the join response
        const patchedMembers = updatedTeam.members.map(m =>
          m.username === joinedUser.username ? { ...m, color: joinedUser.color } : m
        );
        setCurrentTeam({ ...updatedTeam, members: patchedMembers });
        console.log('[Lobby] Updated currentTeam after join:', { ...updatedTeam, members: patchedMembers });
      } else {
        setStatus('Failed to get updated team data.');
      }
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
      console.log('[Lobby] Creating team:', newTeamName);
      const created = await TeamService.createTeamTeamCreatePost({ name: newTeamName } as TeamCreate);
      console.log('[Lobby] Team created successfully:', created);
      const successMessage = `Created team ${created.name}. Now join it!`;
      console.log('[Lobby] Setting status message:', successMessage);
      setStatus(successMessage);
      setNewTeamName('');
      await fetchTeams();
      // Don't auto-join - let user manually join the team
    } catch (err: any) {
      console.error('[Lobby] Failed to create team:', err);
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
      // First, ensure all team members have colors assigned
      console.log('[Lobby] Ensuring all team members have colors assigned...');
      const colorPromises = currentTeam.members
        .filter(member => !member.color || member.color === 'gray')
        .map(async (member) => {
          try {
            console.log('[Lobby] Assigning color to member:', member.username);
            const result = await TeamService.assignColorToUserTeamAssignColorPost({
              user_id: member.id,
              team_id: currentTeam.id
            });
            console.log('[Lobby] Color assignment result for', member.username, ':', result);
            return result;
          } catch (error) {
            console.error('[Lobby] Failed to assign color to', member.username, ':', error);
            return null;
          }
        });
      
      await Promise.all(colorPromises);
      
      // Create the game session
      const sess = await GameService.createGameSessionGameSessionPost({ team_id: currentTeam.id });
      setSession(sess);
      console.log('[Lobby] setSession', sess);
      
      // Re-fetch teams and update currentTeam to ensure members are up-to-date
      await fetchTeams();
      setTeams(prevTeams => {
        const updatedTeam = prevTeams.find(t => t.id === currentTeam.id);
        if (updatedTeam) {
          setCurrentTeam(updatedTeam);
          console.log('[Lobby] Updated currentTeam after start game:', updatedTeam);
        }
        return prevTeams;
      });
      setStatus('Game session started!');
    } catch (err: any) {
      setStatus('Failed to start game session. There may already be an active session.');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleLeaveTeam = () => {
    setCurrentTeam(null);
    setSession(null); // Clear session when leaving team
    setStatus('You left the team.');
  };

  // Find the current user object from the team members
  const currentUser = currentTeam?.members?.find(m => m.username === currentName) || null;

  // Remove WebSocket creation and mouse tracking from Lobby
  // These will be handled by GameSessionView instead

  // If a session is active (not in 'lobby'), show the game session view
  if (session && currentTeam && session.status !== 'lobby') {
    if (!currentUser) {
      // Debug log if currentUser is not found
      console.warn('[Lobby] currentUser not found in team members:', { currentName, currentTeam });
      return (
        <Container variant="full">
          <StatusMessage type="error">
            You are not recognized as a member of this team. Please rejoin or refresh.<br />
            (Debug: username <b>{currentName}</b> not in team members)
          </StatusMessage>
        </Container>
      );
    }
    console.log('[Lobby] Rendering GameSessionView', { session, currentTeam, currentUser });
    return <GameSessionView session={session} user={currentUser} team={currentTeam} />;
  }

  return (
    <Container variant="full">
      <Card className="card-military animate-fade-in">
        <h1 className="military-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          DO YOU HAVE WHAT IT TAKES?
        </h1>
        <div className="username-input-container" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={!!currentName}
            aria-label="Enter your username"
            style={{ maxWidth: 180 }}
          />
          <button 
            className="btn-military" 
            onClick={handleSetName} 
            disabled={!!currentName} 
            aria-label="Set Username"
          >
            Set Username
          </button>
          {currentName && <span className="hello-message" style={{ marginLeft: 8 }}>Hello, <b>{currentName}</b>!</span>}
        </div>
      </Card>
      <Card className="card-military animate-fade-in">
        <h2 className="military-subtitle">Available Teams:</h2>
        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <StatusMessage type="error">{error}</StatusMessage>
        ) : teams.length === 0 ? (
          <StatusMessage type="info">No available teams. Create a new team to get started!</StatusMessage>
        ) : (
          <List aria-label="Available teams" className="teams-list">
            {teams.map(team => (
              <List.Item key={team.id}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span className="ds-list-item__name">{team.name}</span>
                  <span aria-label={`${team.player_count} of ${team.max_players} members`} style={{ color: '#666', fontWeight: 400, fontSize: '0.9em' }}>
                    {team.player_count}/{team.max_players} players
                  </span>
                </div>
                <button
                  className="btn-military"
                  onClick={() => handleJoinTeam(team)}
                  disabled={!!currentTeam && currentTeam.id === team.id || !currentName}
                  aria-label={`Join team ${team.name}`}
                  style={{ minWidth: 70 }}
                >
                  Join
                </button>
              </List.Item>
            ))}
          </List>
        )}
        <div className="new-team-input-container" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Input
            type="text"
            placeholder="New team name"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            disabled={creatingTeam}
            aria-label="Enter new team name"
            style={{ maxWidth: 180 }}
          />
          <button 
            className="btn-military" 
            onClick={handleCreateTeam} 
            disabled={creatingTeam || !currentName} 
            aria-label="Create New Team"
          >
            + Create New Team
          </button>
        </div>
      </Card>
      {currentTeam && (
        <Card className="card-military animate-fade-in">
          <h2 className="military-subtitle">Your Team: {currentTeam.name}</h2>
          <ul className="team-members-list" style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
            {currentTeam.members.map((member) => (
              <li key={member.id}>{member.username}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn-military danger" 
              onClick={handleLeaveTeam} 
              aria-label="Leave Team"
            >
              Leave Team
            </button>
            <button
              className="btn-military success"
              onClick={handleStartGame}
              disabled={sessionLoading || !!session}
              aria-label="Start Game"
            >
              {sessionLoading ? 'Starting...' : session ? 'Game In Progress' : 'Start Game'}
            </button>
            <button
              className="btn-military"
              onClick={async () => {
                if (currentTeam) {
                  await fetchTeams();
                  const updatedTeams = await TeamService.getAvailableTeamsTeamAvailableGet();
                  const updatedTeam = updatedTeams.find(t => t.id === currentTeam.id);
                  if (updatedTeam) {
                    setCurrentTeam(updatedTeam);
                    setStatus('Team data refreshed.');
                  }
                }
              }}
              aria-label="Refresh Team Data"
            >
              Refresh
            </button>
          </div>
          {session && (
            <StatusMessage type="info" style={{ marginTop: 12 }}>
              Game session active! (Session ID: {session.id})
            </StatusMessage>
          )}
        </Card>
      )}
      {status && (
        <div className={`status-message ${status?.toLowerCase().includes('fail') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}
      <button
        className="btn-military"
        onClick={() => {
          setTimeout(() => window.location.reload(), 100);
        }}
        style={{ marginTop: 24 }}
        aria-label="Return to Lobby"
      >
        Return to Lobby
      </button>
      
    </Container>
  );
};

export default Lobby; 