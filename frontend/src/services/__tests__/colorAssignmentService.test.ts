import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColorAssignmentService } from '../colorAssignmentService';
import { TeamService } from '../../api';

// Mock the API service
vi.mock('../../api', () => ({
  TeamService: {
    assignColorToUserTeamAssignColorPost: vi.fn(),
    validateTeamColorsTeamTeamIdValidateColorsGet: vi.fn(),
    resolveColorConflictsTeamTeamIdResolveConflictsPost: vi.fn(),
    getAvailableColorsTeamTeamIdAvailableColorsGet: vi.fn(),
  }
}));

describe('ColorAssignmentService', () => {
  let service: ColorAssignmentService;

  beforeEach(() => {
    service = ColorAssignmentService.getInstance();
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = ColorAssignmentService.getInstance();
      const instance2 = ColorAssignmentService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('assignColorToUser', () => {
    it('should successfully assign a color to a user', async () => {
      const mockResponse = {
        user_id: 1,
        color: 'red',
        success: true,
        message: 'Color assigned successfully'
      };

      vi.mocked(TeamService.assignColorToUserTeamAssignColorPost).mockResolvedValue(mockResponse);

      const result = await service.assignColorToUser(1, 1);

      expect(result).toEqual({
        success: true,
        color: 'red',
        message: 'Color assigned successfully'
      });
      expect(TeamService.assignColorToUserTeamAssignColorPost).toHaveBeenCalledWith({
        user_id: 1,
        team_id: 1
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(TeamService.assignColorToUserTeamAssignColorPost).mockRejectedValue(new Error('API Error'));

      const result = await service.assignColorToUser(1, 1);

      expect(result).toEqual({
        success: false,
        color: '',
        message: 'Failed to assign color'
      });
    });
  });

  describe('validateTeamColors', () => {
    it('should validate team colors successfully', async () => {
      const mockResponse = {
        team_id: 1,
        is_valid: true,
        conflicts: []
      };

      vi.mocked(TeamService.validateTeamColorsTeamTeamIdValidateColorsGet).mockResolvedValue(mockResponse);

      const result = await service.validateTeamColors(1);

      expect(result).toEqual({
        is_valid: true,
        conflicts: []
      });
    });

    it('should handle validation errors', async () => {
      vi.mocked(TeamService.validateTeamColorsTeamTeamIdValidateColorsGet).mockRejectedValue(new Error('Validation Error'));

      const result = await service.validateTeamColors(1);

      expect(result).toEqual({
        is_valid: false,
        conflicts: []
      });
    });
  });

  describe('resolveColorConflicts', () => {
    it('should resolve color conflicts successfully', async () => {
      const mockResponse = {
        team_id: 1,
        reassignments: { '1': 'red', '2': 'blue' },
        success: true,
        message: 'Resolved conflicts for 2 users'
      };

      vi.mocked(TeamService.resolveColorConflictsTeamTeamIdResolveConflictsPost).mockResolvedValue(mockResponse);

      const result = await service.resolveColorConflicts(1);

      expect(result).toEqual({
        success: true,
        reassignments: { '1': 'red', '2': 'blue' },
        message: 'Resolved conflicts for 2 users'
      });
    });

    it('should handle resolution errors', async () => {
      vi.mocked(TeamService.resolveColorConflictsTeamTeamIdResolveConflictsPost).mockRejectedValue(new Error('Resolution Error'));

      const result = await service.resolveColorConflicts(1);

      expect(result).toEqual({
        success: false,
        reassignments: {},
        message: 'Failed to resolve conflicts'
      });
    });
  });

  describe('getAvailableColors', () => {
    it('should get available colors successfully', async () => {
      const mockResponse = {
        team_id: 1,
        available_colors: ['yellow', 'green'],
        used_colors: ['red', 'blue']
      };

      vi.mocked(TeamService.getAvailableColorsTeamTeamIdAvailableColorsGet).mockResolvedValue(mockResponse);

      const result = await service.getAvailableColors(1);

      expect(result).toEqual({
        available_colors: ['yellow', 'green'],
        used_colors: ['red', 'blue']
      });
    });

    it('should handle get available colors errors', async () => {
      vi.mocked(TeamService.getAvailableColorsTeamTeamIdAvailableColorsGet).mockRejectedValue(new Error('Get Colors Error'));

      const result = await service.getAvailableColors(1);

      expect(result).toEqual({
        available_colors: [],
        used_colors: []
      });
    });
  });

  describe('utility methods', () => {
    it('should return the correct color scheme', () => {
      const colorScheme = service.getColorScheme();
      expect(colorScheme).toEqual(['red', 'blue', 'yellow', 'green']);
    });

    it('should return the correct fallback color', () => {
      const fallbackColor = service.getFallbackColor();
      expect(fallbackColor).toBe('gray');
    });

    it('should return the correct color class', () => {
      expect(service.getColorClass('red')).toBe('player-red');
      expect(service.getColorClass('blue')).toBe('player-blue');
      expect(service.getColorClass('yellow')).toBe('player-yellow');
      expect(service.getColorClass('green')).toBe('player-green');
    });

    it('should return the correct color value', () => {
      expect(service.getColorValue('red')).toBe('#ff4444');
      expect(service.getColorValue('blue')).toBe('#4444ff');
      expect(service.getColorValue('yellow')).toBe('#ffff44');
      expect(service.getColorValue('green')).toBe('#44ff44');
      expect(service.getColorValue('gray')).toBe('#888888');
      expect(service.getColorValue('unknown')).toBe('#888888'); // fallback
    });
  });
});
