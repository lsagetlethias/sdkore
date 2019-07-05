import { CacheException } from '../CacheException';
import { CacheValues } from '../ICache';
import { ICacheSync } from '../ICacheSync';
import { AbstractCache } from './AbstractCache';

type StorageItem<T> = [T, number];

/**
 * A storage cache is based on browser local or session storage object.
 */
export class StorageCache<T = any> extends AbstractCache<T> implements ICacheSync<T> {
    protected storage: Storage;
    protected namespace: string;

    /**
     * Construct a cache on top of `sessionStorage` (if `persist` is true) or `localStorage`.
     *
     * @param namespace The namespace of the cache. Used to prefix each key
     * @param persist If true, use a `localStorage` instead of a `sessionStorage`
     * @param defaultLifetime The default lifetime
     */
    public constructor(namespace = '', persist = false, defaultLifetime = 0) {
        super(defaultLifetime);
        this.storage = persist ? window.localStorage : window.sessionStorage;
        if (!this.storage || !this.storageAvailable()) {
            throw new CacheException(`${persist ? 'Local' : 'Session'} Storage is not available.`);
        }

        this.namespace = `StorageCache_${namespace}`;
    }

    private storageAvailable() {
        if ('undefined' === typeof Storage) {
            return false;
        }

        try {
            const x = '__storage_test__';
            this.storage.setItem(x, x);
            this.storage.removeItem(x);
            return true;
        } catch (e) {
            /* istanbul ignore next: browser specific checking */
            return (
                e instanceof DOMException &&
                (e.code === 22 ||
                    e.code === 1014 ||
                    e.name === 'QuotaExceededError' ||
                    e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                this.storage.length !== 0
            );
        }
    }

    private hasItem(key: string, now: number) {
        if (null === this.storage.getItem(this.namespace + key)) {
            return false;
        }

        const expiry = this.getStorageItem(key)[1];
        if (expiry && expiry <= now) {
            this.deleteSync(key);

            return false;
        }

        return true;
    }

    private getStorageItem<TReturn = T>(key: string): StorageItem<TReturn> {
        return JSON.parse(this.storage.getItem(this.namespace + key)) || [];
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
        this.storage.removeItem(this.namespace + key);
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
        Object.keys(this.storage).forEach(key => {
            if (key.startsWith(this.namespace)) {
                this.deleteSync(key.replace(this.namespace, ''));
            }
        });
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
        keys.forEach(key => {
            ret[key] = this.hasItem(key, now) ? this.getStorageItem<TReturn>(key)[0] : defaultValue;
        });

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
            this.storage.setItem(this.namespace + key, JSON.stringify([values[key], expiry]));
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
        Object.keys(this.storage).forEach(key => {
            if (key.startsWith(this.namespace)) {
                const expiry = this.getStorageItem(key.replace(this.namespace, ''))[1];
                if (expiry && expiry <= now) {
                    this.deleteSync(key);
                }
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
