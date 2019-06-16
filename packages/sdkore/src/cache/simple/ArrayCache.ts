/* istanbul ignore file: WIP */

import { CacheValues } from '../ICache';
import { ICacheSync } from '../ICacheSync';
import { AbstractCache } from './AbstractCache';

/**
 * An array cache uses an internal not persistent array as cache storage.
 */
export class ArrayCache<T = any> extends AbstractCache<T> implements ICacheSync<T> {
    protected values: Map<string, T> = new Map();
    protected expiries: Map<string, number> = new Map();

    /**
     * @inheritDoc
     */
    public constructor(defaultLifetime = 0) {
        super(defaultLifetime);
        this.valuePseudoType = 'object';
    }

    /**
     * Check if the storage has the asked item.
     *
     * @param key The associated key
     * @param now The now timestamp
     */
    private hasItem(key: string, now: number): boolean {
        return this.expiries.has(key) && (now <= this.expiries.get(key) || !this.delete(key));
    }

    /**
     * @inheritDoc
     */
    public getSync<TReturn = T>(key: string, defaultValue: TReturn = null) {
        return this.getMultipleSync([key], defaultValue)[key];
    }

    /**
     * @inheritDoc
     */
    public async get<TReturn = T>(key: string, defaultValue: TReturn = null) {
        return this.getSync(key, defaultValue);
    }

    /**
     * @inheritDoc
     */
    public setSync(key: string, value: T, ttl: number = null) {
        const values: CacheValues<T> = {};
        values[key] = value;
        return this.setMultipleSync(values, ttl);
    }

    /**
     * @inheritDoc
     */
    public async set(key: string, value: T, ttl: number = null) {
        return this.setSync(key, value, ttl);
    }

    /**
     * @inheritDoc
     */
    public deleteSync(key: string) {
        this.values.delete(key);
        this.expiries.delete(key);
        return true;
    }

    /**
     * @inheritDoc
     */
    public async delete(key: string) {
        return this.deleteSync(key);
    }

    /**
     * @inheritDoc
     */
    public clearSync() {
        this.values.clear();
        this.expiries.clear();
        this.values = new Map();
        this.expiries = new Map();
        return true;
    }

    /**
     * @inheritDoc
     */
    public async clear() {
        return this.clearSync();
    }

    /**
     * @inheritDoc
     */
    public getMultipleSync<TReturn = T>(keys: string[], defaultValue: TReturn = null) {
        const now = Date.now();
        const ret: CacheValues<TReturn> = {};
        keys.forEach(key => (ret[key] = this.hasItem(key, now) ? (this.values.get(key) as any) : defaultValue));
        return ret;
    }

    /**
     * @inheritDoc
     */
    public async getMultiple<TReturn = T>(keys: string[], defaultValue: TReturn = null) {
        return this.getMultipleSync(keys, defaultValue);
    }

    /**
     * @inheritDoc
     */
    public setMultipleSync(values: CacheValues<T>, ttl: number = null) {
        const keys = Object.keys(values);

        const normalizedTtl = this.normalizeTtl(ttl);
        if (false === normalizedTtl) {
            return this.deleteMultipleSync(keys);
        }

        const expiry = 0 < normalizedTtl ? Date.now() + (normalizedTtl as number) : Infinity;

        keys.forEach(key => {
            this.values.set(key, values[key]);
            this.expiries.set(key, expiry);
        });

        return true;
    }

    /**
     * @inheritDoc
     */
    public async setMultiple(values: CacheValues<T>, ttl: number = null) {
        return this.setMultipleSync(values, ttl);
    }

    /**
     * @inheritDoc
     */
    public deleteMultipleSync(keys: string[]) {
        keys.forEach(key => this.deleteSync(key));
        return true;
    }

    /**
     * @inheritDoc
     */
    public async deleteMultiple(keys: string[]) {
        return this.deleteMultipleSync(keys);
    }

    /**
     * @inheritDoc
     */
    public hasSync(key: string) {
        return this.hasItem(key, Date.now());
    }

    /**
     * @inheritDoc
     */
    public async has(key: string) {
        return this.hasSync(key);
    }

    /**
     * @inheritDoc
     */
    public resetSync() {
        this.clear();
    }

    /**
     * @inheritDoc
     */
    public async reset() {
        return this.resetSync();
    }

    /**
     * @inheritDoc
     */
    public pruneSync() {
        const now = Date.now();
        this.expiries.forEach((expiry, key) => {
            if (now >= expiry) {
                this.deleteSync(key);
            }
        });
        return true;
    }

    /**
     * @inheritDoc
     */
    public async prune() {
        return this.pruneSync();
    }
}
