export interface CacheValues<T> {
    [p: string]: T;
}

/**
 * The main cache interface to implement.
 * Based on PSR-16 - https://www.php-fig.org/psr/psr-16/
 *
 * A cache can have a strongly typed set of value.
 */
export interface ICache<T = unknown> {
    /**
     * Precise if the cache will be string based or object based in term of internal storage.
     *
     * i.e. if the cache will use JSON.stringify to serialize data.
     */
    valuePseudoType: 'string' | 'object';

    /**
     * Fetches a value from the cache.
     *
     * @param key           The unique key of this item in the cache.
     * @param defaultValue  Default value to return if the key does not exist.
     *
     * @returns The value of the item from the cache, or $default in case of cache miss.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if the key string is not a legal value.
     * @since Typescript 3.3.1
     */
    get<TReturn extends T = T>(key: string, defaultValue?: TReturn): Promise<TReturn>;

    /**
     * Persists data in the cache, uniquely referenced by a key with an optional expiration TTL time.
     *
     * @param key   The key of the item to store.
     * @param value The value of the item to store, must be serializable.
     * @param ttl   Optional. The TTL value of this item. If no value is sent and the driver supports TTL then the library may set a default value for it or let the driver take care of that.
     *
     * @returns True on success and false on failure.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if the key string is not a legal value.
     */
    set(key: string, value: T, ttl?: number): Promise<boolean>;

    /**
     * Delete an item from the cache by its unique key.
     *
     * @param key The unique cache key of the item to delete.
     *
     * @returns True if the item was successfully removed. False if there was an error.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if the key string is not a legal value.
     */
    delete(key: string): Promise<boolean>;

    /**
     * Wipes clean the entire cache's keys.
     *
     * @async
     * @returns True on success and false on failure.
     */
    clear(): Promise<boolean>;

    /**
     * Obtains multiple cache items by their unique keys.
     *
     * @param keys          A list of keys that can obtained in a single operation.
     * @param defaultValue  Default value to return for keys that do not exist.
     *
     * @returns A list of key => value pairs. Cache keys that do not exist or are stale will have $default as value.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if keys is not an array, or if any of the keys are not a legal value.
     * @since Typescript 3.3.1
     */
    getMultiple<TReturn extends T = T>(keys: string[], defaultValue?: TReturn): Promise<CacheValues<TReturn>>;

    /**
     * Persists a set of key => value pairs in the cache, with an optional TTL.
     *
     * @param values A list of key => value pairs for a multiple-set operation.
     * @param ttl?   Optional. The TTL value of this item. If no value is sent and the driver supports TTL then the library may set a default value for it or let the driver take care of that.
     *
     * @returns True on success and false on failure.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if values is not an array, or if any of the values are not a legal value.
     */
    setMultiple(values: CacheValues<T>, ttl?: number): Promise<boolean>;

    /**
     * Deletes multiple cache items in a single operation.
     *
     * @param keys A list of string-based keys to be deleted.
     *
     * @returns True if the items were successfully removed. False if there was an error.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if keys is not an array, or if any of the keys are not a legal value.
     */
    deleteMultiple(keys: string[]): Promise<boolean>;

    /**
     * Determines whether an item is present in the cache.
     *
     * NOTE: It is recommended that has() is only to be used for cache warming type purposes
     * and not to be used within your live applications operations for get/set, as this method
     * is subject to a race condition where your has() will return true and immediately after,
     * another script can remove it making the state of your app out of date.
     *
     * @param key The cache item key.
     *
     * @async
     * @throws InvalidArgumentException MUST be thrown if the key string is not a legal value.
     */
    has(key: string): Promise<boolean>;
}
