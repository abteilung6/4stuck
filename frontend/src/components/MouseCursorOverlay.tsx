import React, { useEffect, useState } from 'react';
import './MouseCursorOverlay.css';
import { useColorAssignment } from '../hooks/useColorAssignment';

interface PlayerCursor {
  userId: number;
  username: string;
  x: number;
  y: number;
  color: string;
  lastUpdate: number;
}

interface MouseCursorOverlayProps {
  sessionId: number;
  currentUserId: number;
  websocket: WebSocket | null;
}

export const MouseCursorOverlay: React.FC<MouseCursorOverlayProps> = ({
  sessionId,
  currentUserId,
  websocket
}) => {
  const [playerCursors, setPlayerCursors] = useState<Map<number, PlayerCursor>>(new Map());
  const { getColorValue } = useColorAssignment();

  useEffect(() => {
    if (!websocket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'mouse_cursor') {
          const { user_id, x, y, color } = message.data;
          
          // Don't show our own cursor
          if (user_id === currentUserId) return;

          setPlayerCursors(prev => {
            const newCursors = new Map(prev);
            newCursors.set(user_id, {
              userId: user_id,
              username: `Player ${user_id}`, // We'll get username from state later
              x,
              y,
              color,
              lastUpdate: Date.now()
            });
            return newCursors;
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.addEventListener('message', handleMessage);

    return () => {
      websocket.removeEventListener('message', handleMessage);
    };
  }, [websocket, currentUserId]);

  // Clean up stale cursors (older than 3 seconds)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setPlayerCursors(prev => {
        const newCursors = new Map(prev);
        for (const [userId, cursor] of newCursors.entries()) {
          if (now - cursor.lastUpdate > 3000) {
            newCursors.delete(userId);
          }
        }
        return newCursors;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="mouse-cursor-overlay" data-testid="mouse-cursor-overlay">
      {Array.from(playerCursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="player-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
            '--cursor-color': getColorValue(cursor.color)
          } as React.CSSProperties}
        >
          <div className="cursor-border"></div>
          <div className="cursor-label">{cursor.username}</div>
        </div>
      ))}
    </div>
  );
}; 