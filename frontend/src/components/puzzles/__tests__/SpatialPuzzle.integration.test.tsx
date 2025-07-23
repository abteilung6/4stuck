import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpatialPuzzle } from '../SpatialPuzzle';

// Mock the design system components
vi.mock('../../design-system/Card', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
}));

vi.mock('../../design-system/SectionTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h2 data-testid="section-title">{children}</h2>,
}));

vi.mock('../../design-system/Typography', () => ({
  BodyText: ({ children }: { children: React.ReactNode }) => <p data-testid="body-text">{children}</p>,
}));

// Mock requestAnimationFrame to control the game loop
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true,
});

describe('SpatialPuzzle Integration Tests', () => {
  const mockProps = {
    puzzle: {
      id: 1,
      type: 'spatial',
      data: {}
    },
    answer: '',
    setAnswer: vi.fn(),
    submitAnswer: vi.fn(),
    submitAnswerWithAnswer: vi.fn(),
    loading: false,
    feedback: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Reset the mock to return a callback that we can control
    mockRequestAnimationFrame.mockImplementation((callback) => {
      // Store the callback so we can call it manually
      (mockRequestAnimationFrame as any).lastCallback = callback;
      return 1; // Return a mock ID
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should start game loop and move obstacle', async () => {
    render(<SpatialPuzzle {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('spatial-puzzle-area')).toBeInTheDocument();
    });
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
    const obstacle = screen.getByTestId('spatial-puzzle-area').querySelector('.spatial-puzzle-obstacle');
    expect(obstacle).toBeInTheDocument();
    const initialStyle = obstacle?.getAttribute('style') || '';
    const initialLeft = parseInt(initialStyle.match(/left:\s*(\d+)px/)?.[1] || '0');
    const gameLoopCallback = (mockRequestAnimationFrame as any).lastCallback;
    if (gameLoopCallback) {
      gameLoopCallback();
    }
    await waitFor(() => {
      const currentStyle = obstacle?.getAttribute('style') || '';
      const currentLeft = parseInt(currentStyle.match(/left:\s*(\d+)px/)?.[1] || '0');
      expect(currentLeft).not.toBe(initialLeft);
    }, { timeout: 1000 });
  });

  it('should detect win condition when circle reaches bottom', async () => {
    const mockSetAnswer = vi.fn();
    const mockSubmitAnswerWithAnswer = vi.fn();
    render(
      <SpatialPuzzle
        {...mockProps}
        setAnswer={mockSetAnswer}
        submitAnswerWithAnswer={mockSubmitAnswerWithAnswer}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('spatial-puzzle-area')).toBeInTheDocument();
    });
    const gameArea = screen.getByTestId('spatial-puzzle-area');
    const circle = gameArea?.querySelector('.spatial-puzzle-circle');
    expect(circle).toBeInTheDocument();
    const mockRect = {
      left: 0,
      top: 0,
      width: 400,
      height: 600,
    };
    gameArea!.getBoundingClientRect = vi.fn().mockReturnValue(mockRect);
    fireEvent.mouseDown(gameArea!, {
      clientX: 200,
      clientY: 50
    });
    fireEvent.mouseMove(gameArea!, {
      clientX: 200,
      clientY: 580
    });
    fireEvent.mouseUp(gameArea!);
    const gameLoopCallback = (mockRequestAnimationFrame as any).lastCallback;
    if (gameLoopCallback) {
      gameLoopCallback();
    }
    await waitFor(() => {
      expect(mockSetAnswer).toHaveBeenCalledWith('solved');
    }, { timeout: 2000 });
  });

  it('should allow retry after hitting obstacle', async () => {
    const mockSetAnswer = vi.fn();
    const mockSubmitAnswerWithAnswer = vi.fn();
    render(
      <SpatialPuzzle
        {...mockProps}
        setAnswer={mockSetAnswer}
        submitAnswerWithAnswer={mockSubmitAnswerWithAnswer}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('spatial-puzzle-area')).toBeInTheDocument();
    });
    const gameArea = screen.getByTestId('spatial-puzzle-area');
    const circle = gameArea?.querySelector('.spatial-puzzle-circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveStyle({ backgroundColor: 'rgb(0, 102, 204)' });
    const obstacle = gameArea?.querySelector('.spatial-puzzle-obstacle');
    expect(obstacle).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 100));
    const circleAfterTime = gameArea?.querySelector('.spatial-puzzle-circle');
    expect(circleAfterTime).toHaveStyle({ backgroundColor: 'rgb(0, 102, 204)' });
    expect(circleAfterTime).toBeInTheDocument();
    expect(obstacle).toBeInTheDocument();
  });
}); 