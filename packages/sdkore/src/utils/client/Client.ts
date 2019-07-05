import axios, { AxiosRequestConfig } from 'axios';
import { RequestException, SDKException } from '../../error';
import { REQUEST_HEADERS as h } from '../Const';
import { Logger } from '../Logger';
import { AbstractClient } from './AbstractClient';
import { ClientResponse, HTTPMethod, RequestHeaderObject } from './IClient';

/**
 * @inheritdoc
 */
export class Client extends AbstractClient {
    /**
     * @inheritdoc
     */
    protected async getToken(): Promise<boolean> {
        try {
            const cachedToken = await this.cache.get<string>('token');
            const token = cachedToken || this.token;

            if (!token) {
                throw new SDKException('No token provided.');
            }

            if (!cachedToken) {
                await this.cache.set('token', token, this.tokenExpiration);
            }

            this.addHeaders({ [h.AUTHORIZATION]: `Bearer ${token}` });
            return (this.connected = true);
        } catch (e) {
            /* istanbul ignore next: browser specific checking */
            if (e.response === void 0) {
                throw new SDKException("Can't get any token. Unknown error.", e);
            }

            Logger.warn(`Can't get any token. Code=${e.response.status}`, JSON.stringify(e.response.data));
            return false;
        }
    }

    /**
     * @inheritdoc
     */
    public async request<T = any>(
        url: string,
        method: HTTPMethod,
        data?: unknown,
        headers: RequestHeaderObject = null,
        config: AxiosRequestConfig = {},
    ): Promise<ClientResponse<T>> {
        const token = await this.getToken();
        if (this.connected || token) {
            try {
                const response = await this.axios.request<T>({
                    data,
                    headers,
                    method,
                    url,
                    cancelToken: new axios.CancelToken(c => {
                        this.canceler = c;
                    }),
                    ...(config as any),
                });

                const res: ClientResponse<T> = { ...(response as any) };

                res.getHeader = header =>
                    res.headers[header] || res.headers[String.prototype.toLowerCase.apply(header)];

                return res;
            } catch (e) {
                /* istanbul ignore next: browser specific checking */
                if (!e.response) {
                    throw new SDKException('Unknown error.', e);
                }
                throw new RequestException('Unexpected response.', e, e.response.status, e.response.data);
            }
        }

        throw new SDKException(`Can't perform any request. (${url})`);
    }
}
