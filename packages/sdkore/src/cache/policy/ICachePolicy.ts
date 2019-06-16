import { AxiosAdapter } from 'axios';
import { ICache } from '../ICache';

export interface ICachePolicy<T = unknown> {
    readonly cache?: ICache<T>;
    readonly strict?: true;

    /**
     * Get a axios adapter that handle a cache (e.g. for GET requests).
     */
    getAxiosAdapter(): AxiosAdapter;

    /**
     * Set a cache system to the policy.
     *
     * @throws {CacheException} if the cache is already set.
     */
    setCache(cache: ICache<T>): void;
}
