import React, { useState, useRef, useEffect } from 'react';

const WS_BASE = 'ws://localhost:8000/ws/game/';

const GameSessionDemo: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [inputId, setInputId] = useState('');
  const [wsState, setWsState] = useState<any>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(WS_BASE + sessionId);
    wsRef.current = ws;
    ws.onopen = () => setWsError(null);
    ws.onmessage = (event) => {
      try {
        setWsState(JSON.parse(event.data));
      } catch (e) {
        setWsError('Failed to parse message: ' + event.data);
      }
    };
    ws.onerror = (e) => setWsError('WebSocket error');
    ws.onclose = () => setWsError('WebSocket closed');
    return () => {
      ws.close();
    };
  }, [sessionId]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionId(inputId.trim());
    setWsState(null);
    setWsError(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Game Session WebSocket Demo</h2>
      <form onSubmit={handleConnect} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Enter session ID"
          value={inputId}
          onChange={e => setInputId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Connect</button>
      </form>
      {wsError && <div style={{ color: 'red' }}>Error: {wsError}</div>}
      {wsState && (
        <pre style={{ background: '#222', color: '#0f0', padding: 16, borderRadius: 8 }}>
          {JSON.stringify(wsState, null, 2)}
        </pre>
      )}
      {!wsState && !wsError && sessionId && <div>Waiting for game state...</div>}
    </div>
  );
};

export default GameSessionDemo;
