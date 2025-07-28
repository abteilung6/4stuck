/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Puzzle State: Puzzle state response model
 */
export type PuzzleState = {
    /**
     * Puzzle ID
     */
    id: number;
    /**
     * Puzzle type
     */
    type: PuzzleState.type;
    /**
     * Puzzle-specific data
     */
    data: any;
    /**
     * Puzzle status
     */
    status: PuzzleState.status;
    /**
     * Correct answer for the puzzle
     */
    correct_answer: string;
};
export namespace PuzzleState {
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

