import { AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { ICache, ICachePolicy } from '../../cache';
import { RequestHeaderName, ResponseHeaderName } from '../Const';

export interface ClientParameters {
    url: string;
    username?: string;
    password?: string;
    token?: string;
    cachePolicy?: ICachePolicy | false;
    tokenExpiration?: number;
}

export type HeadersList = RequestHeaderObject & { [K in string]: string };

declare module 'axios' {
    interface AxiosRequestConfig {
        forceUpdate?: boolean;
        cache?: boolean;
    }
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type RequestHeaderObject = { [key in RequestHeaderName | string]: string };

export type ClientResponse<T> = AxiosResponse<T> & { getHeader(header: ResponseHeaderName | string): any };

/**
 * This the main client used by every accessor.
 *
 * A client is an axios wrapper that handle `token-authentication` Wynd API route automaticaly.
 *
 * The Client class has an internal pool of client that can retrieve a client by its unique "id" (a symbol).
 *
 * When a client is registering itself, it sets his unique identifier in the pool AND as the default client in
 * the in-SDK `GlobalStore`. Every new pre built accessor will use the last default client set in this store.
 */
export interface IClient {
    /**
     * Return the cache used by the client.
     */
    readonly cache: ICache;

    /**
     * Get the canceler to cancel the last request.
     */
    lastRequestCanceler: Canceler;

    /**
     * The expiration time set to the token. By default, a token is available 12 hours on the API.
     *
     * So a good practice is to set it at 8 hours on the SDK.
     */
    readonly tokenExpiration: number;

    /**
     * Change the current cache status of axios (or whatever library used).
     */
    setRequestCache(cache?: boolean): void;

    /**
     * Check the current cache status from axios (or whatever library used).
     */
    isRequestCache(): boolean;

    /**
     * Add permanent headers before any requests.
     */
    addHeaders(headers: HeadersList): void;

    /**
     * Remove headers from any request by their keys.
     */
    removeHeaders(headerKeys: Array<keyof HeadersList>): void;

    /**
     * Get all headers actually set in client.
     */
    getHeaders(): HeadersList;

    /**
     * Register the client as default client for accessor and save it in the pool.
     */
    register(): symbol;

    /**
     * Make an agnostic request to the API.
     *
     * @param url The request url to call. Remember that the baseUrl is already prefixed
     * @param method The HTTP verb to use
     * @param data The data to pass
     * @param headers The header object to pass during the call
     * @param config The additional axios config to use when revelent
     *
     * @throws {Error} When the request have failed.
     */
    request<T = any>(
        url: string,
        method: HTTPMethod,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>>;

    /**
     * Make a *GET* request to the API.
     *
     * @param url The request url to call. Remember that the baseUrl is already prefixed
     * @param data The data to pass
     * @param headers The header object to pass during the call
     * @param config The additional axios config to use when revelent
     */
    get<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>>;

    /**
     * Make a *POST* request to the API.
     *
     * @param url The request url to call. Remember that the baseUrl is already prefixed
     * @param data The data to pass
     * @param headers The header object to pass during the call
     * @param config The additional axios config to use when revelent
     */
    post<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>>;

    /**
     * Make a *PUT* request to the API.
     *
     * @param url The request url to call. Remember that the baseUrl is already prefixed
     * @param data The data to pass
     * @param headers The header object to pass during the call
     * @param config The additional axios config to use when revelent
     */
    put<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>>;

    /**
     * Make a *DELETE* request to the API.
     *
     * @param url The request url to call. Remember that the baseUrl is already prefixed
     * @param data The data to pass
     * @param headers The header object to pass during the call
     * @param config The additional axios config to use when revelent
     */
    delete<T = any>(
        url: string,
        data?: unknown,
        headers?: RequestHeaderObject,
        config?: AxiosRequestConfig,
    ): Promise<ClientResponse<T>>;
}
