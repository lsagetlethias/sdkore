import axios, { AxiosInstance, AxiosRequestConfig, Canceler } from 'axios';
import { DefaultCachePolicy, ICachePolicy, StorageCache } from '../../cache';
import { SDKException } from '../../error';
import { GlobalStore } from '../../store/GlobalStore';
import { DEFAULT_TOKEN_EXPIRATION } from '../Const';
import { ClientParameters, ClientResponse, HeadersList, HTTPMethod, IClient, RequestHeaderObject } from './IClient';

/**
 * @inheritdoc
 */
export abstract class AbstractClient implements IClient {
    /**
     * @inheritdoc
     */
    public get cache() {
        return this.cachePolicy.cache;
    }

    /**
     * @inheritdoc
     */
    public get lastRequestCanceler(): Canceler {
        return this.canceler;
    }

    protected static readonly POOL: Map<symbol, IClient> = new Map();

    protected axios: AxiosInstance;
    protected readonly uid: symbol = Symbol();
    protected connected = false;

    protected url: string;
    protected readonly api_username: string;
    protected readonly api_password: string;
    protected readonly token: string;

    protected readonly cachePolicy: ICachePolicy;
    protected readonly cachePrefix: string;

    protected canceler: Canceler;

    /**
     * @inheritdoc
     */
    public readonly tokenExpiration: number;

    /**
     * Construct a client based on the configuration set.
     *
     * Either fill in a `username` and a `password`
     * or a `token`.
     *
     * By default, a client will use a `StorageCache` in sessionStorage mode, but you can set another cache or
     * even your own cache (only if it is implementing the PSR-16 `ICache` interface).
     *
     * By default, a client will set a token expiration at 8 hours locally.
     *
     * By default, a client will set a request caching expiration at 120 seconds locally.
     *
     * @param param The param object to configure the client
     */
    public constructor(param: ClientParameters) {
        this.api_username = param.username;
        this.api_password = param.password;
        this.token = param.token;
        this.tokenExpiration = param.tokenExpiration ? param.tokenExpiration : DEFAULT_TOKEN_EXPIRATION;
        this.cachePrefix = `${param.url}_${this.api_username || this.token}_`;

        this.cachePolicy = param.cachePolicy || new DefaultCachePolicy(new StorageCache(this.cachePrefix, false));

        this.initAxios(param.url, param.cachePolicy);
    }

    /**
     * Get a client from its unique identifier generated during the `register()` phase.
     *
     * @param s The unique identifier attached to the client to find
     */
    public static getInstance(s: symbol): IClient {
        if (AbstractClient.POOL.has(s)) {
            return AbstractClient.POOL.get(s);
        }

        throw new SDKException("Can't retrieve the asked instance");
    }

    /**
     * Init the connector, either axios or another client library.
     */
    protected initAxios(url: string, cachePolicy: ICachePolicy | false) {
        this.axios = axios.create({
            baseURL: this.url = url,
            headers: {
                common: {
                    Authorization: '',
                    'Content-Type': 'application/json',
                    ...(false === cachePolicy ? {} : { 'Cache-Control': 'max-age=no-cache' }),
                },
            },
            ...(false === cachePolicy ? {} : { adapter: this.cachePolicy.getAxiosAdapter() }),
        });
    }

    /**
     * (Re)set a token inside the client when it's expired or not available anymore.
     *
     * Can and SHOULD be extended when a client is used on another API than Wynd's.
     */
    protected abstract async getToken(): Promise<boolean>;

    /**
     * @inheritdoc
     */
    public setRequestCache(cache = !this.axios.defaults.cache) {
        this.axios.defaults.cache = cache;
    }

    /**
     * @inheritdoc
     */
    public isRequestCache() {
        return !!this.axios.defaults.cache;
    }

    /**
     * @inheritdoc
     */
    public addHeaders(headers: HeadersList) {
        const headerKeys = Object.entries(headers);
        for (const [key, value] of headerKeys) {
            this.axios.defaults.headers.common[key] = value;
        }
    }

    /**
     * @inheritdoc
     */
    public removeHeaders(headerKeys: Array<keyof HeadersList>) {
        for (const key of headerKeys) {
            delete this.axios.defaults.headers.common[key];
        }
    }

    /**
     * @inheritdoc
     */
    public register(): symbol {
        AbstractClient.POOL.set(this.uid, this);
        return (GlobalStore.lastClientId = this.uid);
    }

    /**
     * @inheritdoc
     */
    public abstract async request<T = any>(
        url: string,
        method: HTTPMethod,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>>;

    /**
     * @inheritdoc
     */
    public async get<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>> {
        return this.request<T>(url, 'GET', data, headers, config);
    }

    /**
     * @inheritdoc
     */
    public async post<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>> {
        return this.request<T>(url, 'POST', data, headers, config);
    }

    /**
     * @inheritdoc
     */
    public async put<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>> {
        return this.request<T>(url, 'PUT', data, headers, config);
    }

    /**
     * @inheritdoc
     */
    public async delete<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>> {
        return this.request<T>(url, 'DELETE', data, headers, config);
    }
}
