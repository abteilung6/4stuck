/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TeamCreate } from '../models/TeamCreate';
import type { TeamOut } from '../models/TeamOut';
import type { TeamWithMembersOut } from '../models/TeamWithMembersOut';
import type { UserCreate } from '../models/UserCreate';
import type { UserOut } from '../models/UserOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TeamService {
    /**
     * Register User
     * @param requestBody
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static registerUserTeamRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/team/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Team
     * @param requestBody
     * @returns TeamOut Successful Response
     * @throws ApiError
     */
    public static createTeamTeamCreatePost(
        requestBody: TeamCreate,
    ): CancelablePromise<TeamOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/team/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Join Team
     * @param username
     * @param teamId
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static joinTeamTeamJoinPost(
        username: string,
        teamId: number,
    ): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/team/join',
            query: {
                'username': username,
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Teams
     * @returns TeamWithMembersOut Successful Response
     * @throws ApiError
     */
    public static listTeamsTeamGet(): CancelablePromise<Array<TeamWithMembersOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/team/',
        });
    }
}
