/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserOut } from './UserOut';
export type AvailableTeamOut = {
    id: number;
    name: string;
    members: Array<UserOut>;
    player_count: number;
    max_players?: number;
    status: string;
    game_session_id?: (number | null);
    game_status?: (string | null);
};

