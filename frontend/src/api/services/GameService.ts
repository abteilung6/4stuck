/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameSessionCreate } from '../models/GameSessionCreate';
import type { GameSessionResponse } from '../models/GameSessionResponse';
import type { GameSessionStateUpdate } from '../models/GameSessionStateUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameService {
    /**
     * Create Game Session
     * @param requestBody
     * @returns GameSessionResponse Successful Response
     * @throws ApiError
     */
    public static createGameSessionGameSessionPost(
        requestBody: GameSessionCreate,
    ): CancelablePromise<GameSessionResponse> {
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
     * @returns GameSessionResponse Successful Response
     * @throws ApiError
     */
    public static getCurrentSessionGameSessionTeamIdGet(
        teamId: number,
    ): CancelablePromise<GameSessionResponse> {
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
    /**
     * Start Game Session
     * Start the game (transition from countdown to active)
     * @param sessionId
     * @returns GameSessionResponse Successful Response
     * @throws ApiError
     */
    public static startGameSessionGameSessionSessionIdStartPost(
        sessionId: number,
    ): CancelablePromise<GameSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/game/session/{session_id}/start',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Game Session State
     * Update game session state (lobby, countdown, active, finished)
     * @param sessionId
     * @param requestBody
     * @returns GameSessionResponse Successful Response
     * @throws ApiError
     */
    public static updateGameSessionStateGameSessionSessionIdStatePost(
        sessionId: number,
        requestBody: GameSessionStateUpdate,
    ): CancelablePromise<GameSessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/game/session/{session_id}/state',
            path: {
                'session_id': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
