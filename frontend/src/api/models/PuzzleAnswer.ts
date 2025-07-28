/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Puzzle Answer: Answer submission for a puzzle
 */
export type PuzzleAnswer = {
    /**
     * ID of the puzzle being answered
     */
    puzzle_id: number;
    /**
     * The answer submitted by the user
     */
    answer: string;
    /**
     * ID of the user submitting the answer
     */
    user_id: number;
};

