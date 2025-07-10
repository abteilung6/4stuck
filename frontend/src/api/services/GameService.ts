/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameSessionCreate } from '../models/GameSessionCreate';
import type { GameSessionOut } from '../models/GameSessionOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameService {
    /**
     * Create Game Session
     * @param requestBody
     * @returns GameSessionOut Successful Response
     * @throws ApiError
     */
    public static createGameSessionGameSessionPost(
        requestBody: GameSessionCreate,
    ): CancelablePromise<GameSessionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/game/session',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Current Session
     * @param teamId
     * @returns GameSessionOut Successful Response
     * @throws ApiError
     */
    public static getCurrentSessionGameSessionTeamIdGet(
        teamId: number,
    ): CancelablePromise<GameSessionOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/game/session/{team_id}',
            path: {
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
