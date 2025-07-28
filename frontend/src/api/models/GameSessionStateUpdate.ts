/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Game Session State Update: Request to update game session state
 */
export type GameSessionStateUpdate = {
    /**
     * New status for the game session
     */
    status: GameSessionStateUpdate.status;
};
export namespace GameSessionStateUpdate {
    /**
     * New status for the game session
     */
    export enum status {
        LOBBY = 'lobby',
        COUNTDOWN = 'countdown',
        ACTIVE = 'active',
        FINISHED = 'finished',
    }
}

