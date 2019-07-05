import { CacheValues, ICache } from '../ICache';
import { IPrunable } from '../IPrunable';
import { IResettable } from '../IResettable';

/**
 * AbstractCache is a standard implementation of the ICache interface.
 * It provide basic methods to start with.
 */
export abstract class AbstractCache<T> implements ICache<T>, IResettable, IPrunable {
    /**
     * The default lifetime when normalizing the ttl
     */
    protected defaultLifetime: number;

    /**
     * @inheritdoc
     */
    public valuePseudoType: 'string' | 'object' = 'string';

    /**
     * Construct a cache with a default lifetime.
     *
     * @param defaultLifetime The default lifetime
     */
    protected constructor(defaultLifetime = 0) {
        this.defaultLifetime = defaultLifetime;
    }

    /**
     * Normalize a time to live number to get the default lifetime if necesary.
     *
     * @param ttl The ttl to normalize
     */
    protected normalizeTtl(ttl: number): number | boolean {
        if (null === ttl) {
            return this.defaultLifetime;
        }

        return 0 < ttl ? ttl : false;
    }

    /**
     * @inheritDoc
     */
    public abstract get<TReturn extends T = T>(key: string, defaultValue?: TReturn): Promise<TReturn>;
    /**
     * @inheritDoc
     */
    public abstract set(key: string, value: T, ttl?: number): Promise<boolean>;
    /**
     * @inheritDoc
     */
    public abstract delete(key: string): Promise<boolean>;
    /**
     * @inheritDoc
     */
    public abstract clear(): Promise<boolean>;
    /**
     * @inheritDoc
     */
    public abstract getMultiple<TReturn extends T = T>(
        keys: string[],
        defaultValue?: TReturn,
    ): Promise<CacheValues<TReturn>>;
    /**
     * @inheritDoc
     */
    public abstract setMultiple(values: CacheValues<T>, ttl?: number): Promise<boolean>;
    /**
     * @inheritDoc
     */
    public abstract deleteMultiple(keys: string[]): Promise<boolean>;
    /**
     * @inheritDoc
     */
    public abstract has(key: string): Promise<boolean>;
    /**
     * @inheritDoc
     */
    public abstract reset(): Promise<void>;
    /**
     * @inheritDoc
     */
    public abstract prune(): Promise<boolean>;
}
