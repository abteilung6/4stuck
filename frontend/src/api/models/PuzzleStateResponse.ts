/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Puzzle State Response: Puzzle state for API responses
 */
export type PuzzleStateResponse = {
    /**
     * Puzzle ID
     */
    id: number;
    /**
     * Puzzle type
     */
    type: PuzzleStateResponse.type;
    /**
     * Puzzle-specific data
     */
    data: any;
    /**
     * Puzzle status
     */
    status: PuzzleStateResponse.status;
    /**
     * Correct answer for the puzzle
     */
    correct_answer: string;
};
export namespace PuzzleStateResponse {
    /**
     * Puzzle type
     */
    export enum type {
        MEMORY = 'memory',
        SPATIAL = 'spatial',
        CONCENTRATION = 'concentration',
        MULTITASKING = 'multitasking',
    }
    /**
     * Puzzle status
     */
    export enum status {
        ACTIVE = 'active',
        COMPLETED = 'completed',
        FAILED = 'failed',
    }
}

