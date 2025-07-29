/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignColorRequest } from '../models/AssignColorRequest';
import type { AvailableTeam } from '../models/AvailableTeam';
import type { ColorAssignmentResponse } from '../models/ColorAssignmentResponse';
import type { TeamCreate } from '../models/TeamCreate';
import type { TeamResponse } from '../models/TeamResponse';
import type { UserCreate } from '../models/UserCreate';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TeamService {
    /**
     * Register User
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static registerUserTeamRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<UserResponse> {
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
     * @returns TeamResponse Successful Response
     * @throws ApiError
     */
    public static createTeamTeamCreatePost(
        requestBody: TeamCreate,
    ): CancelablePromise<TeamResponse> {
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
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static joinTeamTeamJoinPost(
        username: string,
        teamId: number,
    ): CancelablePromise<UserResponse> {
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
     * Assign Color To User
     * Assign a unique color to a user within their team.
     * @param requestBody
     * @returns ColorAssignmentResponse Successful Response
     * @throws ApiError
     */
    public static assignColorToUserTeamAssignColorPost(
        requestBody: AssignColorRequest,
    ): CancelablePromise<ColorAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/team/assign-color',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Validate Team Colors
     * Validate that all players in a team have unique colors.
     * @param teamId
     * @returns ColorAssignmentResponse Successful Response
     * @throws ApiError
     */
    public static validateTeamColorsTeamTeamIdValidateColorsGet(
        teamId: number,
    ): CancelablePromise<ColorAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/team/{team_id}/validate-colors',
            path: {
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resolve Color Conflicts
     * Resolve any color conflicts in a team by reassigning colors.
     * @param teamId
     * @returns ColorAssignmentResponse Successful Response
     * @throws ApiError
     */
    public static resolveColorConflictsTeamTeamIdResolveConflictsPost(
        teamId: number,
    ): CancelablePromise<ColorAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/team/{team_id}/resolve-conflicts',
            path: {
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Available Colors
     * Get available and used colors for a team.
     * @param teamId
     * @returns ColorAssignmentResponse Successful Response
     * @throws ApiError
     */
    public static getAvailableColorsTeamTeamIdAvailableColorsGet(
        teamId: number,
    ): CancelablePromise<ColorAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/team/{team_id}/available-colors',
            path: {
                'team_id': teamId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Available Teams
     * Get only teams that are available for players to join.
     * A team is available if:
     * 1. It has fewer than 4 players
     * 2. It has no active game session (lobby, countdown, active)
     * @returns AvailableTeam Successful Response
     * @throws ApiError
     */
    public static getAvailableTeamsTeamAvailableGet(): CancelablePromise<Array<AvailableTeam>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/team/available',
        });
    }
    /**
     * List Teams
     * List all teams (for admin/debug purposes).
     * For user-facing team listing, use /team/available instead.
     * @returns TeamResponse Successful Response
     * @throws ApiError
     */
    public static listTeamsTeamGet(): CancelablePromise<Array<TeamResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/team/',
        });
    }
}
