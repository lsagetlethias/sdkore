/**
 * Flag a cache as prunable
 */
export interface IPrunable {
    /**
     * Delete all values that have expired.
     */
    prune(): Promise<boolean>;

    /**
     * Same as prune but synchronized.
     */
    pruneSync?(): Promise<boolean>;
}
