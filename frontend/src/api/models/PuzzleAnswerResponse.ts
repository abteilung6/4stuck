/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Puzzle Answer Response: Response to puzzle answer submission
 */
export type PuzzleAnswerResponse = {
    /**
     * Whether the answer was correct
     */
    correct: boolean;
    /**
     * ID of user who received points
     */
    awarded_to_user_id?: (number | null);
    /**
     * Number of points awarded
     */
    points_awarded: number;
    /**
     * ID of next puzzle (if any)
     */
    next_puzzle_id?: (number | null);
    /**
     * Next puzzle data (if any)
     */
    next_puzzle?: null;
};

