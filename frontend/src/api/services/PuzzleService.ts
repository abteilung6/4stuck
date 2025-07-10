/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PuzzleAnswer } from '../models/PuzzleAnswer';
import type { PuzzleCreate } from '../models/PuzzleCreate';
import type { PuzzleResult } from '../models/PuzzleResult';
import type { PuzzleState } from '../models/PuzzleState';
import type { TeamPoints } from '../models/TeamPoints';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PuzzleService {
    /**
     * Create Puzzle
     * @param requestBody
     * @returns PuzzleState Successful Response
     * @throws ApiError
     */
    public static createPuzzlePuzzleCreatePost(
        requestBody: PuzzleCreate,
    ): CancelablePromise<PuzzleState> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/puzzle/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Current Puzzle
     * @param userId
     * @returns PuzzleState Successful Response
     * @throws ApiError
     */
    public static getCurrentPuzzlePuzzleCurrentUserIdGet(
        userId: number,
    ): CancelablePromise<PuzzleState> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/puzzle/current/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit Answer
     * @param requestBody
     * @returns PuzzleResult Successful Response
     * @throws ApiError
     */
    public static submitAnswerPuzzleAnswerPost(
        requestBody: PuzzleAnswer,
    ): CancelablePromise<PuzzleResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/puzzle/answer',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Team Points
     * @param teamId
     * @returns TeamPoints Successful Response
     * @throws ApiError
     */
    public static getTeamPointsPuzzlePointsTeamIdGet(
        teamId: number,
    ): CancelablePromise<TeamPoints> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/puzzle/points/{team_id}',
            path: {
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Decay Points
     * @param teamId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static decayPointsPuzzleDecayTeamIdPost(
        teamId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/puzzle/decay/{team_id}',
            path: {
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
