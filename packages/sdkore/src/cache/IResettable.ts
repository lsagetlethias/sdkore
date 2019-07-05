/**
 * Flag a cache as resettable.
 */
export interface IResettable {
    /**
     * Reset the whole cache. Can be a simple clear or a much more complex operation.
     */
    reset(): Promise<void>;

    /**
     * Same as reset but synchronized.
     */
    resetSync?(): void;
}
