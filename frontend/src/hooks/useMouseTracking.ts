import { useCallback, useEffect, useRef } from 'react';
import { getViewportInfo } from '../utils/cursorPositioning';

export interface MousePosition {
  x: number;
  y: number;
}

export interface UseMouseTrackingProps {
  sessionId: number;
  userId: number;
  websocket: WebSocket | null;
  throttleMs?: number;
}

export const useMouseTracking = ({
  sessionId,
  userId,
  websocket,
  throttleMs = 50
}: UseMouseTrackingProps) => {
  const lastSentPosition = useRef<MousePosition | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMousePosition = useCallback((x: number, y: number) => {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      console.log('🔍 useMouseTracking: WebSocket not ready, cannot send mouse position');
      return;
    }

    // Check if position has changed significantly (avoid sending same position)
    if (lastSentPosition.current) {
      const dx = Math.abs(x - lastSentPosition.current.x);
      const dy = Math.abs(y - lastSentPosition.current.y);
      if (dx < 3 && dy < 3) {
        return; // Position hasn't changed enough
      }
    }

    // Get current viewport information for better remote positioning
    const viewport = getViewportInfo();

    const message = {
      type: 'mouse_position',
      user_id: userId,
      x: x,
      y: y,
      timestamp: new Date().toISOString(),
      viewport: {
        screenWidth: viewport.screenWidth,
        screenHeight: viewport.screenHeight,
        viewportWidth: viewport.viewportWidth,
        viewportHeight: viewport.viewportHeight,
        devicePixelRatio: viewport.devicePixelRatio,
        zoomLevel: viewport.zoomLevel
      }
    };

    websocket.send(JSON.stringify(message));
    lastSentPosition.current = { x, y };
  }, [websocket, userId]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    
    // Clear existing timeout
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }

    // Set new timeout for throttled sending
    throttleTimeoutRef.current = setTimeout(() => {
      sendMousePosition(event.clientX, event.clientY);
    }, throttleMs);
  }, [sendMousePosition, throttleMs]);

  useEffect(() => {
    // Add global mouse move listener
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  return {
    sendMousePosition
  };
}; 