/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PuzzleState } from './PuzzleState';
export type PuzzleResult = {
    correct: boolean;
    awarded_to_user_id: (number | null);
    points_awarded: number;
    next_puzzle_id: (number | null);
    next_puzzle?: (PuzzleState | null);
};

