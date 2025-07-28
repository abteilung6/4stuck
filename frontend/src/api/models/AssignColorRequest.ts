/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Assign Color Request: Request to assign a color to a user
 */
export type AssignColorRequest = {
    /**
     * ID of the user to assign color to
     */
    user_id: number;
    /**
     * ID of the team the user belongs to
     */
    team_id: number;
    /**
     * Preferred color (optional)
     */
    preferred_color?: null;
};

