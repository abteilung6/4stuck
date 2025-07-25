import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useColorAssignment } from '../useColorAssignment';
import { colorAssignmentService } from '../../services/colorAssignmentService';
import { getPlayerColor } from '../useColorAssignment';

// Mock the color assignment service
vi.mock('../../services/colorAssignmentService', () => ({
  colorAssignmentService: {
    assignColorToUser: vi.fn(),
    validateTeamColors: vi.fn(),
    resolveColorConflicts: vi.fn(),
    getAvailableColors: vi.fn(),
    getColorScheme: vi.fn(),
    getFallbackColor: vi.fn(),
    getColorClass: vi.fn(),
    getColorValue: vi.fn(),
  }
}));

describe('useColorAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(colorAssignmentService.getColorScheme).mockReturnValue(['red', 'blue', 'yellow', 'green']);
    vi.mocked(colorAssignmentService.getFallbackColor).mockReturnValue('gray');
    vi.mocked(colorAssignmentService.getColorClass).mockImplementation((color) => `player-${color}`);
    vi.mocked(colorAssignmentService.getColorValue).mockImplementation((color) => {
      const colorMap: Record<string, string> = {
        'red': '#ff4444',
        'blue': '#4444ff',
        'yellow': '#ffff44',
        'green': '#44ff44',
        'gray': '#888888'
      };
      return colorMap[color] || colorMap.gray;
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useColorAssignment());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('assignColorToUser', () => {
    it('should successfully assign color to user', async () => {
      const mockResult = {
        success: true,
        color: 'red',
        message: 'Color assigned successfully'
      };

      vi.mocked(colorAssignmentService.assignColorToUser).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useColorAssignment());

      let assignmentResult;
      await act(async () => {
        assignmentResult = await result.current.assignColorToUser(1, 1);
      });

      expect(assignmentResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(colorAssignmentService.assignColorToUser).toHaveBeenCalledWith(1, 1);
    });

    it('should handle assignment failure', async () => {
      const mockResult = {
        success: false,
        color: '',
        message: 'No available colors'
      };

      vi.mocked(colorAssignmentService.assignColorToUser).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useColorAssignment());

      let assignmentResult;
      await act(async () => {
        assignmentResult = await result.current.assignColorToUser(1, 1);
      });

      expect(assignmentResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('No available colors');
    });

    it('should handle assignment error', async () => {
      vi.mocked(colorAssignmentService.assignColorToUser).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useColorAssignment());

      let assignmentResult;
      await act(async () => {
        assignmentResult = await result.current.assignColorToUser(1, 1);
      });

      expect(assignmentResult).toEqual({
        success: false,
        color: '',
        message: 'API Error'
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('API Error');
    });
  });

  describe('validateTeamColors', () => {
    it('should successfully validate team colors', async () => {
      const mockResult = {
        is_valid: true,
        conflicts: []
      };

      vi.mocked(colorAssignmentService.validateTeamColors).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useColorAssignment());

      let validationResult;
      await act(async () => {
        validationResult = await result.current.validateTeamColors(1);
      });

      expect(validationResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(colorAssignmentService.validateTeamColors).toHaveBeenCalledWith(1);
    });

    it('should handle validation error', async () => {
      vi.mocked(colorAssignmentService.validateTeamColors).mockRejectedValue(new Error('Validation Error'));

      const { result } = renderHook(() => useColorAssignment());

      let validationResult;
      await act(async () => {
        validationResult = await result.current.validateTeamColors(1);
      });

      expect(validationResult).toEqual({
        is_valid: false,
        conflicts: []
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Validation Error');
    });
  });

  describe('resolveColorConflicts', () => {
    it('should successfully resolve color conflicts', async () => {
      const mockResult = {
        success: true,
        reassignments: { '1': 'red', '2': 'blue' },
        message: 'Resolved conflicts for 2 users'
      };

      vi.mocked(colorAssignmentService.resolveColorConflicts).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useColorAssignment());

      let resolutionResult;
      await act(async () => {
        resolutionResult = await result.current.resolveColorConflicts(1);
      });

      expect(resolutionResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(colorAssignmentService.resolveColorConflicts).toHaveBeenCalledWith(1);
    });

    it('should handle resolution failure', async () => {
      const mockResult = {
        success: false,
        reassignments: {},
        message: 'Failed to resolve conflicts'
      };

      vi.mocked(colorAssignmentService.resolveColorConflicts).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useColorAssignment());

      let resolutionResult;
      await act(async () => {
        resolutionResult = await result.current.resolveColorConflicts(1);
      });

      expect(resolutionResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to resolve conflicts');
    });
  });

  describe('getAvailableColors', () => {
    it('should successfully get available colors', async () => {
      const mockResult = {
        available_colors: ['yellow', 'green'],
        used_colors: ['red', 'blue']
      };

      vi.mocked(colorAssignmentService.getAvailableColors).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useColorAssignment());

      let colorsResult;
      await act(async () => {
        colorsResult = await result.current.getAvailableColors(1);
      });

      expect(colorsResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(colorAssignmentService.getAvailableColors).toHaveBeenCalledWith(1);
    });

    it('should handle get available colors error', async () => {
      vi.mocked(colorAssignmentService.getAvailableColors).mockRejectedValue(new Error('Get Colors Error'));

      const { result } = renderHook(() => useColorAssignment());

      let colorsResult;
      await act(async () => {
        colorsResult = await result.current.getAvailableColors(1);
      });

      expect(colorsResult).toEqual({
        available_colors: [],
        used_colors: []
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Get Colors Error');
    });
  });

  describe('utility functions', () => {
    it('should return correct color scheme', () => {
      const { result } = renderHook(() => useColorAssignment());

      const colorScheme = result.current.getColorScheme();
      expect(colorScheme).toEqual(['red', 'blue', 'yellow', 'green']);
      expect(colorAssignmentService.getColorScheme).toHaveBeenCalled();
    });

    it('should return correct fallback color', () => {
      const { result } = renderHook(() => useColorAssignment());

      const fallbackColor = result.current.getFallbackColor();
      expect(fallbackColor).toBe('gray');
      expect(colorAssignmentService.getFallbackColor).toHaveBeenCalled();
    });

    it('should return correct color class', () => {
      const { result } = renderHook(() => useColorAssignment());

      const colorClass = result.current.getColorClass('red');
      expect(colorClass).toBe('player-red');
      expect(colorAssignmentService.getColorClass).toHaveBeenCalledWith('red');
    });

    it('should return correct color value', () => {
      const { result } = renderHook(() => useColorAssignment());

      const colorValue = result.current.getColorValue('red');
      expect(colorValue).toBe('#ff4444');
      expect(colorAssignmentService.getColorValue).toHaveBeenCalledWith('red');
    });
  });

  describe('loading state', () => {
    it('should set loading state during async operations', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(colorAssignmentService.assignColorToUser).mockReturnValue(promise);

      const { result } = renderHook(() => useColorAssignment());

      act(() => {
        result.current.assignColorToUser(1, 1);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          success: true,
          color: 'red',
          message: 'Color assigned successfully'
        });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
}); 

describe('getPlayerColor', () => {
  const teamMembers = [
    { id: 1, color: 'red' },
    { id: 2, color: 'blue' },
    { id: 3, color: undefined },
  ];

  it('returns color from team member if available', () => {
    expect(getPlayerColor({ id: 1 }, teamMembers)).toBe('red');
    expect(getPlayerColor({ id: 2 }, teamMembers)).toBe('blue');
  });

  it('returns color from player object if not in team members', () => {
    expect(getPlayerColor({ id: 4, color: 'yellow' }, teamMembers)).toBe('yellow');
  });

  it('returns color from player object if team member has no color', () => {
    expect(getPlayerColor({ id: 3, color: 'green' }, teamMembers)).toBe('green');
  });

  it('returns gray if neither team member nor player has color', () => {
    expect(getPlayerColor({ id: 5 }, teamMembers)).toBe('gray');
    expect(getPlayerColor({ id: 3 }, teamMembers)).toBe('gray');
  });

  it('handles empty teamMembers array', () => {
    expect(getPlayerColor({ id: 1, color: 'red' }, [])).toBe('red');
    expect(getPlayerColor({ id: 1 }, [])).toBe('gray');
  });
}); 