/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Available Team: Team that can accept new players
 */
export type AvailableTeam = {
    /**
     * Team identifier
     */
    id: number;
    /**
     * Team name
     */
    name: string;
    /**
     * Current team members
     */
    members: Array<any>;
    /**
     * Number of players in the team
     */
    player_count: number;
    /**
     * Maximum number of players allowed in the team
     */
    max_players?: (number | null);
    /**
     * Current team status
     */
    status: any;
    /**
     * ID of active game session (if any)
     */
    game_session_id?: (number | null);
    /**
     * Status of active game session (if any)
     */
    game_status?: ('lobby' | 'countdown' | 'active' | 'finished' | null);
};

