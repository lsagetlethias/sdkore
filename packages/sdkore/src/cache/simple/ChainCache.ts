import { CacheValues, ICache } from '../ICache';
import { InvalidArgumentException } from '../InvalidArgumentException';
import { AbstractCache } from './AbstractCache';

/**
 * A chain cache allows to have multiple cache in one.
 */
export class ChainCache<T = any> extends AbstractCache<T> {
    private readonly miss: T;
    private readonly caches: Array<ICache<T>>;
    private readonly cacheCount: number;

    /**
     * Construct a cache from a list of caches.
     *
     * @param caches A list of cache that will be chained
     * @param defaultLifetime The default lifetime to set for each cache
     */
    public constructor(caches: Array<ICache<T>>, defaultLifetime = 0) {
        if (!caches.length) {
            throw new InvalidArgumentException('At least one cache must be specified.');
        }

        super(defaultLifetime);

        this.miss = {} as any;
        this.caches = Array.from(caches);
        this.cacheCount = this.caches.length;

        this.valuePseudoType = this.caches.some(c => c.valuePseudoType === 'string') ? 'string' : 'object';
    }

    private getMiss<TReturn = T>(defaultValue: TReturn): TReturn {
        return null !== defaultValue ? defaultValue : (this.miss as any);
    }

    private async *generateItems<TReturn extends T = T>(
        values: CacheValues<TReturn>,
        cacheIndex: number,
        miss: TReturn,
        defaultValue: TReturn,
    ): AsyncIterableIterator<[string, TReturn]> {
        const missing: string[] = [];
        const nextCacheIndex = cacheIndex + 1;
        const nextCache = this.caches[nextCacheIndex] || null;

        for (const key in values) {
            const value = values[key];
            if (miss !== value) {
                yield [key, value];
            } else if (!nextCache) {
                yield [key, defaultValue];
            } else {
                missing.push(key);
            }
        }

        if (missing.length) {
            const cache = this.caches[cacheIndex];
            const iter = this.generateItems(
                await nextCache.getMultiple(missing, miss),
                nextCacheIndex,
                miss,
                defaultValue,
            );

            for await (const [key, value] of iter) {
                if (miss !== value) {
                    await cache.set(key, value as any, this.defaultLifetime);
                    yield [key, value];
                } else {
                    yield [key, defaultValue];
                }
            }
        }
    }

    /**
     * @inheritDoc
     */
    public async get<TReturn extends T = T>(key: string, defaultValue: TReturn = null) {
        const miss = this.getMiss(defaultValue);

        let value: TReturn;
        for (let i = 0; i < this.caches.length; i++) {
            const cache = this.caches[i];
            value = await cache.get(key, miss);

            if (miss !== value) {
                let j = i;
                while (0 <= --j) {
                    await this.caches[j].set(key, value as any, this.defaultLifetime);
                }

                return value;
            }
        }

        return defaultValue;
    }

    /**
     * @inheritDoc
     */
    public async set(key: string, value: T, ttl: number = null) {
        let saved = true;
        let i = this.cacheCount;

        while (i--) {
            saved = (await this.caches[i].set(key, value, ttl)) && saved;
        }
        return saved;
    }

    /**
     * @inheritDoc
     */
    public async delete(key: string) {
        let deleted = true;
        let i = this.cacheCount;

        while (i--) {
            deleted = (await this.caches[i].delete(key)) && deleted;
        }

        return deleted;
    }

    /**
     * @inheritDoc
     */
    public async clear() {
        let cleared = true;
        let i = this.cacheCount;

        while (i--) {
            cleared = (await this.caches[i].clear()) && cleared;
        }

        return cleared;
    }

    /**
     * @inheritDoc
     */
    public async getMultiple<TReturn extends T = T>(keys: string[], defaultValue: TReturn = null) {
        const ret: CacheValues<TReturn> = {};
        const miss = this.getMiss(defaultValue);
        for await (const [key, value] of this.generateItems(
            await this.caches[0].getMultiple(keys, miss),
            0,
            miss,
            defaultValue,
        )) {
            ret[key] = value;
        }

        return ret;
    }

    /**
     * @inheritDoc
     */
    public async setMultiple(values: CacheValues<T>, ttl: number = null) {
        let saved = true;
        let i = this.cacheCount;

        while (i--) {
            saved = (await this.caches[i].setMultiple(values, ttl)) && saved;
        }
        return saved;
    }

    /**
     * @inheritDoc
     */
    public async deleteMultiple(keys: string[]) {
        let deleted = true;
        let i = this.cacheCount;

        while (i--) {
            deleted = (await this.caches[i].deleteMultiple(keys)) && deleted;
        }
        return deleted;
    }

    /**
     * @inheritDoc
     */
    public async has(key: string) {
        for (const cache of this.caches) {
            if (await cache.has(key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @inheritDoc
     */
    public async reset() {
        for (const cache of this.caches) {
            if (cache['reset']) {
                await cache['reset']();
            }
        }
    }

    /**
     * @inheritDoc
     */
    public async prune() {
        let pruned = true;

        for (const cache of this.caches) {
            if (cache['prune']) {
                pruned = (await cache['prune']()) && pruned;
            }
        }

        return pruned;
    }
}
