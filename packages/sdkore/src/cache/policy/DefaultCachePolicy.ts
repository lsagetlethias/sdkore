import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import buildURL from 'axios/lib/helpers/buildURL'; // tslint:disable-line:no-submodule-imports
import { SDKException } from '../../error';
import { DEFAULT_CACHE_EXPIRATION } from '../../utils/Const';
import { UnReadonly } from '../../utils/Types';
import { CacheException } from '../CacheException';
import { ICache } from '../ICache';
import { ICachePolicy } from './ICachePolicy';

interface ResourceNamespaces {
    [P: string]: string[];
}

/**
 * The default cache policy is used to handle cache strategy depending on request made.
 * This policy can be strict and erase any related cache if a resource other than GETed.
 */
export class DefaultCachePolicy implements ICachePolicy {
    private static readonly PREFIX_NAMESPACES = '__DefaultCachePolicy__';

    /**
     * Default cache policy constructor.
     *
     * @param cache The cache sytem used for this policy.
     * @param cacheExpiration The ttl for request caching. Can be set once during construct. Can be set to 0 to disable request caching, but it will be set to 120 seconds by default.
     * @param strict If true, will clear the cache for non-GET verb found during a request for a resource.
     */
    constructor(
        public readonly cache?: ICache,
        private cacheExpiration = DEFAULT_CACHE_EXPIRATION,
        public readonly strict?: true,
    ) {}

    private async handleResourceNamespace(resourceNamespace: string, indexUrl: string, isGetMethod?: true) {
        const namespaces: ResourceNamespaces = JSON.parse(
            await this.cache.get(DefaultCachePolicy.PREFIX_NAMESPACES, '{}'),
        );

        const cacheIndexes = namespaces[resourceNamespace] || [];
        if (!isGetMethod && this.strict) {
            cacheIndexes.forEach(i => this.cache.delete(i));
            delete namespaces[resourceNamespace];
        } else if (isGetMethod) {
            cacheIndexes.push(indexUrl);
            namespaces[resourceNamespace] = cacheIndexes;
        }

        await this.cache.set(DefaultCachePolicy.PREFIX_NAMESPACES, JSON.stringify(namespaces), Infinity);
    }

    /**
     * @inheritdoc
     */
    public setCache(cache: ICache) {
        if (this.cache) {
            throw new CacheException('Cache override in CachePolicy is forbidden.');
        }
        (this as UnReadonly<this>).cache = cache;
    }

    /**
     * @inheritdoc
     */
    public getAxiosAdapter(): AxiosAdapter {
        const adapter = axios.defaults.adapter;

        return async (config: AxiosRequestConfig) => {
            const { url, method, params, paramsSerializer, forceUpdate, cache: useCache = true } = config;

            // if no cache then return pure adapter
            if (!useCache) {
                return adapter(config);
            }

            // get api resource from url
            let resourceNamespace = '';
            try {
                resourceNamespace = config.url
                    .replace(config.baseURL, '')
                    .split('/')[1]
                    .replace(/\?.*/, '');
            } catch (e) {
                return Promise.reject(new SDKException('URL seems to be malformed. No resource found.', e));
            }

            // build cache index from url with param sorted, as string
            let builtURL: string = buildURL(url, params, paramsSerializer);
            const [urlPath, queryString] = builtURL.split('?');
            if (queryString) {
                builtURL = `${urlPath}?${queryString
                    .split('&')
                    .sort()
                    .join('&')}`;
            }
            const index = builtURL;

            // if no GET and strict erase possible cache for given resource
            if ('get' !== method) {
                await this.handleResourceNamespace(resourceNamespace, index);

                return adapter(config);
            }

            // if GET or cache is null or force update of cache is asked
            let responseSerialized = (await this.cache.get(index)) as string;
            if (responseSerialized === null || forceUpdate) {
                let responsePromise: Promise<Partial<AxiosResponse>>;
                try {
                    const { request, config: configToDelete, ...response } = await adapter(config);
                    responsePromise = Promise.resolve(response);
                    responseSerialized = JSON.stringify(response);
                    await Promise.all([
                        this.cache.set(index, responseSerialized, this.cacheExpiration),
                        this.handleResourceNamespace(resourceNamespace, index, true),
                    ]);
                } catch (e) /* istanbul ignore next */ {
                    await this.cache.delete(index);
                    responsePromise = Promise.reject(e);
                }

                return responsePromise;
            }

            try {
                return Promise.resolve(JSON.parse(responseSerialized));
            } catch (e) /* istanbul ignore next: Should not have a invalid JSON from the API */ {
                return Promise.reject(e);
            }
        };
    }
}
