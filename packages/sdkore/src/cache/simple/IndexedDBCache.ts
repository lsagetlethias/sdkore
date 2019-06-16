import * as idb from 'idb-keyval';
import { CacheValues } from '../ICache';
import { AbstractCache } from './AbstractCache';

const DBNAME_PREFIX = 'SDK_IDB_';
const STORENAME = 'sdk';

type StoreItem<T> = [T, number];

/**
 * An indexedDB cache uses a persistent database based storage.
 */
export class IndexedDBCache<T = any> extends AbstractCache<T> {
    protected readonly store: idb.Store;

    /**
     * Construct a cache on top of `indexedDB`.
     *
     * @param dbName The name of the database to connect. It will be prefixed by 'SDK_IDB_'. 'default' by default.
     * @param defaultLifetime The default lifetime
     */
    public constructor(dbName = 'default', defaultLifetime = 0) {
        super(defaultLifetime);
        this.valuePseudoType = 'object';

        this.store = new idb.Store(DBNAME_PREFIX + dbName, STORENAME);
    }

    /**
     * @inheritDoc
     */
    public async get<TReturn = T>(key: string, defaultValue: TReturn = null) {
        return (await this.getMultiple([key], defaultValue))[key];
    }

    /**
     * @inheritDoc
     */
    public async set(key: string, value: T, ttl: number = null) {
        const values: CacheValues<T> = {};
        values[key] = value;
        return this.setMultiple(values, ttl);
    }

    /**
     * @inheritDoc
     */
    public async delete(key: string) {
        await idb.del(key, this.store);
        return true;
    }

    /**
     * @inheritDoc
     */
    public async clear() {
        await idb.clear(this.store);
        return true;
    }

    /**
     * @inheritDoc
     */
    public async getMultiple<TReturn = T>(keys: string[], defaultValue: TReturn = null) {
        const now = Date.now();
        const ret: CacheValues<TReturn> = {};
        for (const key of keys) {
            const item: StoreItem<TReturn> = await idb.get(key, this.store);
            if (void 0 === item) {
                ret[key] = defaultValue;
            } else if (item[1] && item[1] <= now) {
                await this.delete(key);
                ret[key] = defaultValue;
            } else {
                ret[key] = item[0];
            }
        }

        return ret;
    }

    /**
     * @inheritDoc
     */
    public async setMultiple(values: CacheValues<T>, ttl: number = null) {
        const keys = Object.keys(values);

        const normalizedTtl = this.normalizeTtl(ttl);
        if (false === normalizedTtl) {
            return this.deleteMultiple(keys);
        }

        const expiry = 0 < normalizedTtl ? Date.now() + (normalizedTtl as number) : Infinity;

        await Promise.all(
            keys.map(key => {
                return idb.set(key, [values[key], expiry], this.store);
            }),
        );
        return true;
    }

    /**
     * @inheritDoc
     */
    public async deleteMultiple(keys: string[]) {
        await Promise.all(keys.map(key => this.delete(key)));
        return true;
    }

    /**
     * @inheritDoc
     */
    public async has(key: string) {
        const now = Date.now();
        const item: StoreItem<T> = await idb.get(key, this.store);
        if (void 0 === item) {
            return false;
        }

        const expiry = item[1];
        if (expiry && expiry <= now) {
            await this.delete(key);

            return false;
        }

        return true;
    }

    /**
     * @inheritDoc
     */
    public async reset() {
        this.clear();
    }

    /**
     * @inheritDoc
     */
    public async prune() {
        const now = Date.now();
        await Promise.all(
            (await idb.keys(this.store)).map(async key => {
                const expiry = (await idb.get(key, this.store))[1];
                if (expiry && expiry <= now) {
                    return idb.del(key, this.store);
                }
            }),
        );

        return true;
    }
}
