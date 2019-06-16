import { IModel } from '../DTO';
import { GlobalStore } from '../store/GlobalStore';
import { AbstractClient, ClientResponse, IClient } from '../utils/client';
import { RESPONSE_HEADERS } from '../utils/Const';
import { Logger } from '../utils/Logger';
import { Criteria, IAccessor } from './IAccessor';
import { IdentifierCriteria, IIdentifierable } from './IIdentifierable';
import { PaginationInfo } from './IPaginationInfo';

/**
 * The base accessor. This abstract class can be used to implement any new accessor based on a model.
 */
export abstract class AbstractAccessor<T extends IModel<ID, any> = any, ID extends string = 'id'>
    implements IAccessor<T>, IIdentifierable<ID> {
    protected get lastResponse(): ClientResponse<T | T[]> {
        return { ...this._lastResponse };
    }

    /**
     * Return the client maintained by the accessor.
     */
    public get client(): IClient {
        return this._client;
    }

    public get paginationMax(): number {
        return this._paginationMax;
    }

    public set paginationMax(paginationMax: number) {
        if (paginationMax > 50) {
            this._paginationMax = null;
        } else if (paginationMax < 1) {
            this._paginationMax = 1;
        } else {
            this._paginationMax = paginationMax;
        }
    }

    /**
     * Returns this accessor pagination info.
     */
    /* istanbul ignore next: getter is ok ¯\_(ツ)_/¯ */
    public get paginationInfo(): PaginationInfo {
        return { range: this.paginationRange, count: this.paginationCount, limit: this.paginationLimit };
    }

    private _client: IClient;
    private _paginationMax = 50;
    private _lastResponse: ClientResponse<T | T[]> = null;

    private paginationCount: number;
    private paginationLimit: number;
    private paginationRange: number;
    protected readonly route: string;
    protected readonly identifier: ID;

    /**
     * Construct an accessor with the route representing the API resource.
     *
     * @param route The route of the API resource
     * @param identifier the id that we specify here for use later
     * @param paginationMax The max number of data get by page
     * @param clientId The clientId to set if you don't want the default one
     */
    protected constructor(
        route: string,
        identifier: ID = 'id' as ID,
        paginationMax = 50,
        clientId = GlobalStore.lastClientId,
    ) {
        this._client = AbstractClient.getInstance(clientId);
        this.route = route;
        this.identifier = identifier;
        this.paginationMax = paginationMax;
    }

    protected setPaginationInfo(count: number, limit: number, range: number) {
        this.paginationCount = count;
        this.paginationLimit = limit;
        this.paginationRange = range;
    }

    protected async buildQueryString(criteria: Criteria): Promise<string> {
        return (await import('query-string')).stringify(criteria, { arrayFormat: 'bracket' });
    }

    /**
     * @deprecated since v1.22 - use `handleLastResponse` instead.
     */
    /* istanbul ignore next */
    protected handleLastReponse<U = T | T[]>(response: ClientResponse<U>): ClientResponse<U> {
        Logger.warn('DEPRECATED: Will be removed in 1.23');
        return this.handleLastResponse(response);
    }

    /**
     * Save and return a response as the last response for later uses.
     */
    protected handleLastResponse<U = T | T[]>(response: ClientResponse<U>): ClientResponse<U> {
        return (this._lastResponse = response as any);
    }

    /**
     * @inheritdoc
     */
    public setClientId(clientId: symbol) {
        this._client = AbstractClient.getInstance(clientId);
    }

    /**
     * @inheritdoc
     */
    public getIdentifier(): ID {
        return this.identifier;
    }

    /**
     * @inheritdoc
     */
    public async create(model: T): Promise<T> {
        return this.handleLastResponse(await this.client.post<T>(this.route, model)).data;
    }

    /**
     * @inheritdoc
     */
    public async read(): Promise<T[]> {
        return this.handleLastResponse(await this.client.get<T[]>(this.route)).data;
    }

    /**
     * @inheritdoc
     * @deprecated
     */
    /* istanbul ignore next: deprecated method doesn't need to be covered */
    public async readAll(criteria?: Criteria): Promise<T[]> {
        const values: T[] = [];
        for await (const m of this.readPaginated(1, this.paginationMax, criteria)) {
            values.push(...m);
        }

        return values;
    }

    /**
     * @inheritdoc
     */
    public async *readPaginated(
        page = 1,
        paginationMax = this.paginationMax,
        criteria = {},
    ): AsyncIterableIterator<T[]> {
        let currentPage = page;
        let count = Infinity;
        let ret: T[] = null;
        let limit = 0;

        while (limit < count) {
            ret = await this.findAllByCriteria({ range: `${currentPage}-${paginationMax}`, ...criteria });

            const [range, parsedCount] = this.lastResponse.getHeader(RESPONSE_HEADERS.CONTENT_RANGE).split('/'),
                [, parsedLimit] = range.split('-');

            this.setPaginationInfo((count = Number(parsedCount)), (limit = Number(parsedLimit)), range);

            yield ret;

            if (limit < count) {
                currentPage++;
            }
        }

        return ret;
    }

    /**
     * @inheritdoc
     */
    public async readOne(idValue: any): Promise<T> {
        return this.handleLastResponse(await this.client.get<T>(`${this.route}/${idValue}`)).data;
    }

    /**
     * @inheritdoc
     */
    public async update(model: T): Promise<T> {
        const clone = { ...model };
        const idValue = clone[this.identifier];
        delete clone[this.identifier];
        return this.handleLastResponse(await this.client.put<T>(`${this.route}/${idValue}`, clone)).data;
    }

    /**
     * @inheritdoc
     */
    public async delete(model: T): Promise<boolean> {
        this.handleLastResponse(await this.client.delete(`${this.route}/${model[this.identifier]}`));
        return true;
    }

    /**
     * @inheritdoc
     */
    public async findByCriteria(criteria: IdentifierCriteria<ID>): Promise<T> {
        const idValue = criteria[this.identifier];
        delete criteria[this.identifier];
        const query = await this.buildQueryString(criteria);
        return this.handleLastResponse(await this.client.get<T>(`${this.route}/${idValue}?${query}`)).data;
    }

    /**
     * @inheritdoc
     */
    public async findAllByCriteria(criteria: Criteria): Promise<T[]> {
        const query = await this.buildQueryString(criteria);
        return this.handleLastResponse(await this.client.get<T[]>(`${this.route}?${query}`)).data;
    }
}
