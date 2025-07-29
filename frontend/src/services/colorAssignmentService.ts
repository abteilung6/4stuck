import { TeamService } from '../api';
import type {
    ColorAssignmentRequest,
    ColorAssignmentResponse,
    TeamColorValidationResponse,
    ColorConflictResolutionResponse,
    AvailableColorsResponse
} from '../api';

export interface ColorAssignmentResult {
    success: boolean;
    color: string;
    message: string;
}

export interface TeamColorValidationResult {
    is_valid: boolean;
    conflicts: Array<{
        color: string;
        user_ids: number[];
        count: number;
    }>;
}

export interface ColorConflictResolutionResult {
    success: boolean;
    reassignments: Record<string, string>;
    message: string;
}

export interface AvailableColorsResult {
    available_colors: string[];
    used_colors: string[];
}

export class ColorAssignmentService {
    private static instance: ColorAssignmentService;

    private constructor() {}

    public static getInstance(): ColorAssignmentService {
        if (!ColorAssignmentService.instance) {
            ColorAssignmentService.instance = new ColorAssignmentService();
        }
        return ColorAssignmentService.instance;
    }

    /**
     * Assign a unique color to a user within their team
     */
    async assignColorToUser(userId: number, teamId: number): Promise<ColorAssignmentResult> {
        try {
            const request: ColorAssignmentRequest = {
                user_id: userId,
                team_id: teamId
            };

            const response: ColorAssignmentResponse = await TeamService.assignColorToUserTeamAssignColorPost(request);

            return {
                success: response.success,
                color: response.color,
                message: response.message
            };
        } catch (error) {
            console.error('Error assigning color to user:', error);
            return {
                success: false,
                color: '',
                message: 'Failed to assign color'
            };
        }
    }

    /**
     * Validate that all players in a team have unique colors
     */
    async validateTeamColors(teamId: number): Promise<TeamColorValidationResult> {
        try {
            const response: TeamColorValidationResponse = await TeamService.validateTeamColorsTeamTeamIdValidateColorsGet(teamId);

            return {
                is_valid: response.is_valid,
                conflicts: response.conflicts as Array<{
                    color: string;
                    user_ids: number[];
                    count: number;
                }>
            };
        } catch (error) {
            console.error('Error validating team colors:', error);
            return {
                is_valid: false,
                conflicts: []
            };
        }
    }

    /**
     * Resolve any color conflicts in a team by reassigning colors
     */
    async resolveColorConflicts(teamId: number): Promise<ColorConflictResolutionResult> {
        try {
            const response: ColorConflictResolutionResponse = await TeamService.resolveColorConflictsTeamTeamIdResolveConflictsPost(teamId);

            return {
                success: response.success,
                reassignments: response.reassignments,
                message: response.message
            };
        } catch (error) {
            console.error('Error resolving color conflicts:', error);
            return {
                success: false,
                reassignments: {},
                message: 'Failed to resolve conflicts'
            };
        }
    }

    /**
     * Get available and used colors for a team
     */
    async getAvailableColors(teamId: number): Promise<AvailableColorsResult> {
        try {
            const response: AvailableColorsResponse = await TeamService.getAvailableColorsTeamTeamIdAvailableColorsGet(teamId);

            return {
                available_colors: response.available_colors,
                used_colors: response.used_colors
            };
        } catch (error) {
            console.error('Error getting available colors:', error);
            return {
                available_colors: [],
                used_colors: []
            };
        }
    }

    /**
     * Get the color scheme for the game
     */
    getColorScheme(): string[] {
        return ['red', 'blue', 'yellow', 'green'];
    }

    /**
     * Get the fallback color
     */
    getFallbackColor(): string {
        return 'gray';
    }

    /**
     * Get a color class name for CSS styling
     */
    getColorClass(color: string): string {
        return `player-${color}`;
    }

    /**
     * Get a color value for CSS styling
     */
    getColorValue(color: string): string {
        const colorMap: Record<string, string> = {
            'red': '#ff4444',
            'blue': '#4444ff',
            'yellow': '#ffff44',
            'green': '#44ff44',
            'gray': '#888888'
        };

        return colorMap[color] || colorMap.gray;
    }
}

// Export singleton instance
export const colorAssignmentService = ColorAssignmentService.getInstance();
