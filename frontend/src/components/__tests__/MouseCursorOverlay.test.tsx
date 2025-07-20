import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MouseCursorOverlay } from '../MouseCursorOverlay';

// Mock WebSocket
const mockWebSocket = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocket.OPEN,
  send: vi.fn(),
} as any;

describe('MouseCursorOverlay', () => {
  const defaultProps = {
    sessionId: 1,
    currentUserId: 1,
    websocket: mockWebSocket,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MouseCursorOverlay {...defaultProps} />);
    expect(screen.getByTestId('mouse-cursor-overlay')).toBeInTheDocument();
  });

  it('displays player cursors when mouse cursor messages are received', () => {
    render(<MouseCursorOverlay {...defaultProps} />);
    
    // Simulate receiving a mouse cursor message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'mouse_cursor',
        data: {
          user_id: 2,
          x: 100,
          y: 200,
          color: 'red'
        }
      })
    });

    // Trigger the message handler
    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      (call: any) => call[0] === 'message'
    )[1];
    
    act(() => {
      messageHandler(messageEvent);
    });

    // Should display the cursor
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('does not display own cursor', () => {
    render(<MouseCursorOverlay {...defaultProps} />);
    
    // Simulate receiving a mouse cursor message for current user
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'mouse_cursor',
        data: {
          user_id: 1, // Same as currentUserId
          x: 100,
          y: 200,
          color: 'blue'
        }
      })
    });

    // Trigger the message handler
    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      (call: any) => call[0] === 'message'
    )[1];
    messageHandler(messageEvent);

    // Should not display own cursor
    expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<MouseCursorOverlay {...defaultProps} />);
    
    unmount();
    
    expect(mockWebSocket.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });
}); 