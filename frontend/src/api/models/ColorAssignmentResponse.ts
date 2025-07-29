/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Color Assignment Response: Response for color assignment operations
 */
export type ColorAssignmentResponse = {
    /**
     * Whether the operation was successful
     */
    success: boolean;
    /**
     * Response message
     */
    message: string;
    /**
     * Color reassignments made
     */
    reassignments?: (Record<string, any> | null);
    /**
     * Color conflicts found
     */
    conflicts?: null;
};

