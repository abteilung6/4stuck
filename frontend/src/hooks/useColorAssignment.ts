import { useState, useCallback } from 'react';
import { colorAssignmentService, type ColorAssignmentResult, type TeamColorValidationResult, type ColorConflictResolutionResult, type AvailableColorsResult } from '../services/colorAssignmentService';

export interface UseColorAssignmentReturn {
    // State
    isLoading: boolean;
    error: string | null;

    // Color assignment
    assignColorToUser: (userId: number, teamId: number) => Promise<ColorAssignmentResult>;

    // Validation
    validateTeamColors: (teamId: number) => Promise<TeamColorValidationResult>;

    // Conflict resolution
    resolveColorConflicts: (teamId: number) => Promise<ColorConflictResolutionResult>;

    // Available colors
    getAvailableColors: (teamId: number) => Promise<AvailableColorsResult>;

    // Utility functions
    getColorScheme: () => string[];
    getFallbackColor: () => string;
    getColorClass: (color: string) => string;
    getColorValue: (color: string) => string;
}

export function useColorAssignment(): UseColorAssignmentReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assignColorToUser = useCallback(async (userId: number, teamId: number): Promise<ColorAssignmentResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await colorAssignmentService.assignColorToUser(userId, teamId);

            if (!result.success) {
                setError(result.message);
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to assign color';
            setError(errorMessage);
            return {
                success: false,
                color: '',
                message: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const validateTeamColors = useCallback(async (teamId: number): Promise<TeamColorValidationResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await colorAssignmentService.validateTeamColors(teamId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to validate team colors';
            setError(errorMessage);
            return {
                is_valid: false,
                conflicts: []
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resolveColorConflicts = useCallback(async (teamId: number): Promise<ColorConflictResolutionResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await colorAssignmentService.resolveColorConflicts(teamId);

            if (!result.success) {
                setError(result.message);
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to resolve color conflicts';
            setError(errorMessage);
            return {
                success: false,
                reassignments: {},
                message: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAvailableColors = useCallback(async (teamId: number): Promise<AvailableColorsResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await colorAssignmentService.getAvailableColors(teamId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get available colors';
            setError(errorMessage);
            return {
                available_colors: [],
                used_colors: []
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getColorScheme = useCallback(() => {
        return colorAssignmentService.getColorScheme();
    }, []);

    const getFallbackColor = useCallback(() => {
        return colorAssignmentService.getFallbackColor();
    }, []);

    const getColorClass = useCallback((color: string) => {
        return colorAssignmentService.getColorClass(color);
    }, []);

    const getColorValue = useCallback((color: string) => {
        return colorAssignmentService.getColorValue(color);
    }, []);

    return {
        isLoading,
        error,
        assignColorToUser,
        validateTeamColors,
        resolveColorConflicts,
        getAvailableColors,
        getColorScheme,
        getFallbackColor,
        getColorClass,
        getColorValue
    };
}

/**
 * Utility to get the correct color for a player, given the team members list.
 * - Prefer color from team members (by id)
 * - Fallback to color from player object
 * - Fallback to 'gray' if neither is set
 */
export function getPlayerColor(player: { id: number; color?: string }, teamMembers: { id: number; color?: string }[]): string {
  const member = teamMembers.find(m => m.id === player.id);
  if (member && member.color) return member.color;
  if (player.color) return player.color;
  return 'gray';
}
