/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Game Session Out: Game session response model
 */
export type GameSessionOut = {
    /**
     * Game session ID
     */
    id: number;
    /**
     * Team ID
     */
    team_id: number;
    /**
     * Game session status
     */
    status: GameSessionOut.status;
    /**
     * When the game started
     */
    started_at?: (string | null);
    /**
     * When the game ended
     */
    ended_at?: (string | null);
    /**
     * How long the team survived in seconds
     */
    survival_time_seconds?: (number | null);
};
export namespace GameSessionOut {
    /**
     * Game session status
     */
    export enum status {
        LOBBY = 'lobby',
        COUNTDOWN = 'countdown',
        ACTIVE = 'active',
        FINISHED = 'finished',
    }
}

