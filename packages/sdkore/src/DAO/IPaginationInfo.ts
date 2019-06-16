/**
 * Interface used for pagination info in abstractors.
 */
export interface PaginationInfo {
    readonly range: number;
    readonly count: number;
    readonly limit: number;
}
