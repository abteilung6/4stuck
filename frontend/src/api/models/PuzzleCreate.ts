/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Puzzle Create: Request to create a new puzzle
 */
export type PuzzleCreate = {
    /**
     * Type of puzzle to create
     */
    type: PuzzleCreate.type;
    /**
     * ID of the game session
     */
    game_session_id: number;
    /**
     * ID of the user for this puzzle
     */
    user_id: number;
};
export namespace PuzzleCreate {
    /**
     * Type of puzzle to create
     */
    export enum type {
        MEMORY = 'memory',
        SPATIAL = 'spatial',
        CONCENTRATION = 'concentration',
        MULTITASKING = 'multitasking',
    }
}

