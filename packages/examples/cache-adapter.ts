import axios from 'axios';
import {
    AbstractAccessor,
    ArrayCache,
    CacheValues,
    Client,
    DefaultCachePolicy,
    ICache,
    IndexedDBCache,
    NoCache,
    StorageCache,
} from 'sdkore';

/**
 * ArrayCacheAdapter
 *
 * In some environments (like ReactNative), sessionStorage and localStorage are not available. In those cases, you can
 * either use the built-in ArrayCacheAdapter for the Client instead, or provide your own based on the ICacheAdapter.
 */
new Client({
    cachePolicy: new DefaultCachePolicy(new ArrayCache()),
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();

// Custom Cache Adapter
new Client({
    cachePolicy: new DefaultCachePolicy(
        new class implements ICache<any> {
            public valuePseudoType: 'string' | 'object' = 'string';
            public get(key: string, defaultValue?: any): any {
                return null;
            }

            public async set(key: string, value: any, ttl?: number): Promise<boolean> {
                return null;
            }

            public async delete(key: string): Promise<boolean> {
                return null;
            }

            public async clear(): Promise<boolean> {
                return null;
            }

            public async getMultiple(keys: string[], defaultValue?): Promise<CacheValues<any>> {
                return null;
            }

            public async setMultiple(values: CacheValues<any>, ttl?: number): Promise<boolean> {
                return null;
            }

            public async deleteMultiple(keys: string[]): Promise<boolean> {
                return null;
            }

            public async has(key: string): Promise<boolean> {
                return null;
            }
        }(),
    ),
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();

// ---

/**
 * StorageCacheAdapter
 *
 * By default, the Client use a StorageCacheAdapter which itself use sessionStorage by default also.
 * If you want or need to, use can tell the cache to use localStorage instead with persist=true.
 */
new Client({
    cachePolicy: new DefaultCachePolicy(new StorageCache('', true)),
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();

// ---

/**
 * StorageCacheAdapter - namespaces
 *
 * By default, the client set its own namespace to the storage cache adapter. You can change it yourself by adding this
 * namespace as the first parameter of the object instance.
 */
new Client({
    cachePolicy: new DefaultCachePolicy(new StorageCache('MyCustomNamespace_')),
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();

// ---

/**
 * IndexedDBCache
 *
 * You also can use an IndexedDB based cache for better performance. It relies on a very simple but efficient use of the IndexedDB API.
 */
new Client({
    cachePolicy: new DefaultCachePolicy(new IndexedDBCache('MyCustomNameForMyDB_')),
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();

// ---

/**
 * Cache management
 *
 * Their is two types of cache in the SDK, "request cache" and "internal cache".
 * Internal cache is mandatory and cannot be disabled directly (you can always use a NullCache as an adapter but you should expect
 * some issues with token managment for example).
 * Request cache can be disabled in several ways.
 */

// 1 - setting `axios.defaults.cache = false` before a new Client
axios.defaults.cache = false;
new Client({
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();

// 2 - setting axios.default.forceUpdate = false before a new Client. The Client will still have an internal cache but it will be refreshed every time
// DEPRECATED
axios.defaults.forceUpdate = false;
new Client({
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();
// 3 - setting cachePolicy: false in new Client parameters which only disable cache request and let the Client chose a default cache provider for tokens
new Client({
    cachePolicy: false,
    password: 'test',
    url: 'http://api-feature-dt-sdk-js.wyndtech.eu/api',
    username: 'admin_api',
}).register();
// 4 - setting the annotation @NoCache before a GET method in an accessor
class FooAccessor extends AbstractAccessor {
    @NoCache
    public read() {
        return super.read();
    }
}
// 5 - setting forceUpdate: true in a client.request or client.get method (in config parameter) to force a refresh of the cache value
class BarAccessor extends AbstractAccessor {
    public async readUncached() {
        return (await this.client.get(this.route, null, null, { forceUpdate: true })).data;
    }
}
// 6 - setting cache: false in a client.request or client.get method (in config parameter) to do not use the cache during this request only
class BazAccessor extends AbstractAccessor {
    public async read() {
        return (await this.client.get(this.route, null, null, { cache: true })).data;
    }
}
