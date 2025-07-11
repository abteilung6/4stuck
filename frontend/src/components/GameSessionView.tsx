import React, { useEffect, useState } from 'react';
import { PuzzleService } from '../api/services/PuzzleService';
import type { GameSessionOut } from '../api/models/GameSessionOut';
import type { TeamWithMembersOut } from '../api/models/TeamWithMembersOut';
import type { PuzzleState } from '../api/models/PuzzleState';
import type { PuzzleResult } from '../api/models/PuzzleResult';

interface GameSessionViewProps {
  session: GameSessionOut;
  user: { id: number; username: string };
  team: TeamWithMembersOut;
}

const GameSessionView: React.FC<GameSessionViewProps> = ({ session, user, team }) => {
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch current puzzle for the user
  const fetchPuzzle = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await PuzzleService.getCurrentPuzzlePuzzleCurrentUserIdGet(user.id);
      setPuzzle(data);
    } catch (err) {
      setError('No active puzzle for you right now.');
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzle();
    // Optionally, set up polling or WebSocket for real-time updates
    // eslint-disable-next-line
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle) return;
    setLoading(true);
    setFeedback('');
    try {
      const result: PuzzleResult = await PuzzleService.submitAnswerPuzzleAnswerPost({
        puzzle_id: puzzle.id,
        answer,
      });
      if (result.correct) {
        setFeedback('Correct!');
      } else {
        setFeedback('Incorrect.');
      }
      setAnswer('');
      // Refetch puzzle (next or same)
      await fetchPuzzle();
    } catch (err) {
      setFeedback('Failed to submit answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Game Session</h2>
      <div>Team: <b>{team.name}</b></div>
      <div>You are: <b>{user.username}</b></div>
      <div>Session ID: {session.id}</div>
      <hr />
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#b00' }}>{error}</div>}
      {puzzle && (
        <div>
          <h3>Puzzle: {puzzle.type}</h3>
          <pre style={{ background: '#f6f6f6', padding: 8 }}>{JSON.stringify(puzzle.data, null, 2)}</pre>
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Your answer"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={loading}
              style={{ marginRight: 8 }}
            />
            <button type="submit" disabled={loading || !answer}>Submit</button>
          </form>
          {feedback && <div style={{ marginTop: 12, color: feedback === 'Correct!' ? 'green' : '#b00' }}>{feedback}</div>}
        </div>
      )}
      {/* Placeholder for real-time updates, team points, etc. */}
    </div>
  );
};

export default GameSessionView; 