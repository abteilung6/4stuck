import React, { useState, useEffect } from 'react';
import { TeamService } from '../api/services/TeamService';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
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
  const [teams, setTeams] = useState<TeamWithMembersOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [currentTeam, setCurrentTeam] = useState<TeamWithMembersOut | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [session, setSession] = useState<GameSessionOut | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [status, setStatus] = useState('');
  const isFirstLoad = useRef(true);

  const fetchTeams = async () => {
    try {
      const data = await TeamService.listTeamsTeamGet();
      setTeams(data);
    } catch (err) {
      setError('Failed to fetch teams.');
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
      // Set currentTeam to the team we just joined
      setCurrentTeam(team);
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

  // If a session is active, show the game session view
  if (session && currentTeam && currentUser) {
    console.log('[Lobby] Rendering GameSessionView', { session, currentTeam, currentUser });
    return <GameSessionView session={session} user={currentUser} team={currentTeam} />;
  }

  return (
    <Container variant="full">
      <Card>
        <SectionTitle level={2}>Game Lobby</SectionTitle>
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
          <Button onClick={handleSetName} disabled={!!currentName} aria-label="Set Username">
            Set Username
          </Button>
          {currentName && <span className="hello-message" style={{ marginLeft: 8 }}>Hello, <b>{currentName}</b>!</span>}
        </div>
      </Card>
      <Card>
        <SectionTitle level={3}>Available Teams:</SectionTitle>
        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <StatusMessage type="error">{error}</StatusMessage>
        ) : (
          <List aria-label="Available teams" className="teams-list">
            {teams.map(team => (
              <List.Item key={team.id}>
                <span className="ds-list-item__name">{team.name}</span>
                <span aria-label={`${team.members.length} members`} style={{ color: '#444', fontWeight: 400, fontSize: '0.98em' }}>
                  {team.members.length} members
                </span>
                <Button
                  onClick={() => handleJoinTeam(team)}
                  disabled={!!currentTeam && currentTeam.id === team.id || !currentName}
                  aria-label={`Join team ${team.name}`}
                  variant="secondary"
                  style={{ minWidth: 70 }}
                >
                  Join
                </Button>
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
          <Button onClick={handleCreateTeam} disabled={creatingTeam || !currentName} aria-label="Create New Team">
            + Create New Team
          </Button>
        </div>
      </Card>
      {currentTeam && (
        <Card>
          <SectionTitle level={3}>Your Team: {currentTeam.name}</SectionTitle>
          <ul className="team-members-list" style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
            {currentTeam.members.map((member) => (
              <li key={member.id}>{member.username}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={handleLeaveTeam} variant="secondary" aria-label="Leave Team">
              Leave Team
            </Button>
            <Button
              onClick={handleStartGame}
              disabled={sessionLoading || !!session}
              variant="primary"
              aria-label="Start Game"
            >
              {sessionLoading ? 'Starting...' : session ? 'Game In Progress' : 'Start Game'}
            </Button>
          </div>
          {session && (
            <StatusMessage type="info" style={{ marginTop: 12 }}>
              Game session active! (Session ID: {session.id})
            </StatusMessage>
          )}
        </Card>
      )}
      {status && (
        <StatusMessage type={status?.toLowerCase().includes('fail') ? 'error' : 'info'}>
          {status}
        </StatusMessage>
      )}
      <Button
        onClick={() => {
          setTimeout(() => window.location.reload(), 100);
        }}
        variant="secondary"
        style={{ marginTop: 24 }}
        aria-label="Return to Lobby"
      >
        Return to Lobby
      </Button>
    </Container>
  );
};

export default Lobby; 