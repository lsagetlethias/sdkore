import { CacheValues, ICache } from '../ICache';
import { ICacheSync } from '../ICacheSync';

/**
 * A null is used when you don't need cache but have to provide one.
 */
export class NullCache<T = any> implements ICache<T>, ICacheSync<T> {
    /**
     * @inheritDoc
     */
    public readonly valuePseudoType = 'string';

    /**
     * @inheritDoc
     */
    public async get<TReturn = T>(key: string, defaultValue: TReturn = null) {
        return this.getSync(key, defaultValue);
    }

    /**
     * @inheritDoc
     */
    public getSync<TReturn = T>(_key: string, defaultValue: TReturn = null) {
        return defaultValue;
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
    public setSync(_key: string, _value: T, _ttl: number = null) {
        return false;
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
    public deleteSync(_key: string) {
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
    public clearSync() {
        return true;
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
    public getMultipleSync<TReturn = T>(keys: string[], defaultValue: TReturn = null) {
        const ret: CacheValues<TReturn> = {};
        keys.forEach(key => (ret[key] = defaultValue));
        return ret;
    }

    /**
     * @inheritDoc
     */
    public async setMultiple(values: CacheValues<T>, ttl?: number) {
        return this.setMultipleSync(values, ttl);
    }

    /**
     * @inheritDoc
     */
    public setMultipleSync(_values: CacheValues<T>, _ttl?: number) {
        return false;
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
    public deleteMultipleSync(_keys: string[]) {
        return true;
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
    public hasSync(_key: string) {
        return false;
    }
}
