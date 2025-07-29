import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMouseTracking } from '../hooks/useMouseTracking';
import {
  calculateCursorPosition,
  calculateRemoteCursorPosition,
  getCursorStyles,
  getDefaultCursorConfig,
  createResponsiveCursorConfig,
  getViewportInfo,
  normalizeMouseCoordinates,
  denormalizeCoordinates,
  getGameGridInfo,
  type CursorPosition,
  type CursorConfig,
  type ViewportInfo,
  type NormalizedCoordinates
} from '../utils/cursorPositioning';
import './MouseCursorOverlay.css';

// Simple function to get player color
const getPlayerColor = (player: { id: number; color?: string }, teamMembers: Array<{ id: number; username: string; color?: string }>): string => {
  const teamMember = teamMembers.find(member => member.id === player.id);
  return teamMember?.color || 'gray';
};

interface CursorData {
  userId: number;
  username: string;
  color?: string;
  x: number;
  y: number;
  timestamp: string;
  lastUpdate: number;
  viewport?: ViewportInfo; // Store viewport info for remote cursors
  normalized_x?: number; // Store normalized coordinates for consistent positioning
  normalized_y?: number; // Store normalized coordinates for consistent positioning
}

interface MouseCursorOverlayProps {
  sessionId: number;
  currentUserId: number;
  websocket: WebSocket | null;
  teamMembers: Array<{ id: number; username: string; color?: string }>;
}

const MouseCursorOverlay: React.FC<MouseCursorOverlayProps> = ({
  sessionId,
  currentUserId,
  websocket,
  teamMembers
}) => {
  const [playerCursors, setPlayerCursors] = useState<Map<number, CursorData>>(new Map());
  const [cursorConfig, setCursorConfig] = useState<CursorConfig>(createResponsiveCursorConfig());
  const [localViewport, setLocalViewport] = useState<ViewportInfo>(getViewportInfo());
  const websocketRef = useRef<WebSocket | null>(null);

  // Get local user's color


  // Filter out current user from remote cursors
  const remoteCursors = Array.from(playerCursors.values()).filter(cursor => cursor.userId !== currentUserId);



  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'mouse_cursor') {
        if (data.data && data.data.user_id !== currentUserId) {
          // Find the team member to get their username
          const teamMember = teamMembers.find(member => member.id === data.data.user_id);

          setPlayerCursors(prev => {
            const updated = new Map(prev);
            const cursorData = {
              userId: data.data.user_id,
              username: teamMember?.username || `Player ${data.data.user_id}`,
              color: data.data.color,
              x: data.data.x,
              y: data.data.y,
              timestamp: data.data.timestamp,
              lastUpdate: Date.now(),
              viewport: data.data.viewport, // Store remote viewport info if available
              normalized_x: data.data.normalized_x, // Store normalized coordinates if available
              normalized_y: data.data.normalized_y // Store normalized coordinates if available
            };

            updated.set(data.data.user_id, cursorData);
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [currentUserId, teamMembers]);

  // Handle local mouse movement with normalized coordinates
  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Calculate normalized coordinates for consistent positioning
    const normalized = normalizeMouseCoordinates(event.clientX, event.clientY);
    const calculatedPosition = denormalizeCoordinates(normalized);

    // Send normalized coordinates via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'mouse_position',
        user_id: currentUserId,
        x: event.clientX,
        y: event.clientY,
        normalized_x: normalized.x,
        normalized_y: normalized.y,
        timestamp: new Date().toISOString(),
        viewport: localViewport,
        game_area: getGameGridInfo()
      };
      websocket.send(JSON.stringify(message));
    }


  }, [cursorConfig, localViewport, websocket, currentUserId]);

  useEffect(() => {
    // Add local mouse tracking
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocketRef.current = websocket;
      websocket.addEventListener('message', handleMessage);

      return () => {
        websocket.removeEventListener('message', handleMessage);
      };
    }
  }, [websocket, handleMessage]);

  // Clean up old cursors (older than 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPlayerCursors(prev => {
        const updated = new Map(prev);
        for (const [userId, cursor] of updated.entries()) {
          if (now - cursor.lastUpdate > 5000) {
            updated.delete(userId);
          }
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate remote cursor positions with normalized coordinates
  const getRemoteCursorPosition = useCallback((cursor: CursorData): CursorPosition => {
    // If we have normalized coordinates, use them for consistent positioning
    if (cursor.normalized_x !== undefined && cursor.normalized_y !== undefined) {
      return denormalizeCoordinates({
        x: cursor.normalized_x,
        y: cursor.normalized_y
      });
    }

    // Fallback to viewport normalization if no normalized coordinates
    if (cursor.viewport) {
      return calculateRemoteCursorPosition(
        cursor.x,
        cursor.y,
        cursor.viewport,
        localViewport,
        cursorConfig
      );
    } else {
      return calculateCursorPosition(cursor.x, cursor.y, cursorConfig);
    }
  }, [localViewport, cursorConfig]);



  return (
    <div className="mouse-cursor-overlay" data-testid="mouse-cursor-overlay">

      {/* Remote player cursors only - local player uses native browser cursor */}
      {remoteCursors.map(cursor => {
        const color = getPlayerColor({ id: cursor.userId, color: cursor.color }, teamMembers);
        const remotePosition = getRemoteCursorPosition(cursor);

        return (
          <div
            key={cursor.userId}
            className="player-cursor"
            style={{
              ...getCursorStyles(remotePosition, cursorConfig),
              '--cursor-color': color
            } as React.CSSProperties}
          >
            <div className="cursor-border"></div>
            <div className="cursor-label">{cursor.username}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MouseCursorOverlay;
