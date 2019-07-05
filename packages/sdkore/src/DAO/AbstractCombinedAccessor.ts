import { IModel } from '../DTO';
import { SDKException } from '../error';
import { RESPONSE_HEADERS } from '../utils/Const';
import { AbstractAccessor } from './AbstractAccessor';
import { Criteria } from './IAccessor';
import { IdentifierCriteria } from './IIdentifierable';

/**
 * Tha base *combined* accessor is an abstract class that augment the base accessor.
 * It provides a way to combine an API resource with another.
 *
 * e.g.
 * `/a/{id}/b` => find 'b's of a
 * => `AbstractCombinedAccessor<a, b>`
 */
export abstract class AbstractCombinedAccessor<
    T extends IModel,
    U extends IModel,
    ID extends string = 'id',
    IDparent extends string = 'id'
> extends AbstractAccessor<U, ID> {
    protected readonly modelRoute: string;
    protected readonly identifierParent: IDparent;

    /**
     * Construct a combined accessor with a route and a parent route.
     *
     * @param route The route of the targeted API resource
     * @param modelRoute The route of the parent resource
     */
    protected constructor(
        route: string,
        modelRoute: string,
        identifier: ID = 'id' as ID extends 'id' ? ID : ID,
        identifierParent: IDparent = 'id' as IDparent extends 'id' ? IDparent : IDparent,
        paginationMax: number = 50,
    ) {
        super(route, identifier, paginationMax);
        this.modelRoute = modelRoute;
        this.identifierParent = identifierParent;
    }

    public getIdentifierParent(): IDparent {
        return this.identifierParent;
    }

    /**
     * Create a model
     *
     * @param model The model to create
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async create(model: U, parentModel?: T): Promise<U> {
        if (!parentModel) {
            throw new SDKException('For a classic create, use a classic Accessor.');
        }
        return this.handleLastResponse(
            await this.client.post<U>(`${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}`, model),
        ).data;
    }

    /**
     * Read all models from the parent
     *
     * @param parentModel The parent model based on. Should contains the id.
     */
    public async read(parentModel?: T): Promise<U[]> {
        if (!parentModel) {
            throw new SDKException('For a classic read, use a classic Accessor.');
        }
        return this.handleLastResponse(
            await this.client.get<U[]>(`${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}`),
        ).data;
    }

    /**
     * @inheritdoc
     * @deprecated
     */
    /* istanbul ignore next: deprecated method doesn't need to be covered */
    public async readAll(criteria?: Criteria, parentModel?: T): Promise<U[]> {
        if (!parentModel) {
            throw new SDKException('For a classic readAll, use a classic Accessor.');
        }
        const values: U[] = [];
        for await (const m of this.readPaginated(1, this.paginationMax, criteria, parentModel)) {
            values.push(...m);
        }

        return values;
    }

    /**
     * Read all models from the parent and paginate through them
     *
     * @param page The starting page
     * @param paginationMax The max result by page
     * @param criteria A optional list of criterion
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async *readPaginated(
        page: number = 1,
        paginationMax: number = this.paginationMax,
        criteria = {},
        parentModel?: T,
    ): AsyncIterableIterator<U[]> {
        if (!parentModel) {
            throw new SDKException('For a classic read, use a classic Accessor.');
        }

        let currentPage = page;
        let count = Infinity;
        let ret: U[] = null;
        let limit = 0;

        while (limit < count) {
            ret = await this.findAllByCriteria({ range: `${currentPage}-${paginationMax}`, ...criteria }, parentModel);

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
     * Read a single model by its identifier value and from the parent
     *
     * @param idValue The model's identifier value
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async readOne(idValue: any, parentModel?: T): Promise<U> {
        if (!parentModel) {
            throw new SDKException('For a classic readOne, use a classic Accessor.');
        }
        return this.handleLastResponse(
            await this.client.get<U>(
                `${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}/${idValue}`,
            ),
        ).data;
    }

    /**
     * Update a model from the parent. This model **should** contains an identifier value to be updated.
     *
     * @param model The model to update
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async update(model: U, parentModel?: T): Promise<U> {
        if (!parentModel) {
            throw new SDKException('For a classic update, use a classic Accessor.');
        }
        const clone = { ...model };
        const idValue = clone[this.identifier];
        delete clone[this.identifier];
        return this.handleLastResponse(
            await this.client.put<U>(
                `${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}/${idValue}`,
                clone,
            ),
        ).data;
    }

    /**
     * Delete a model. This model **should** contains an identifier value to be deleted.
     *
     * @param model The model to delete
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async delete(model: U, parentModel?: T): Promise<boolean> {
        if (!parentModel) {
            throw new SDKException('For a classic delete, use a classic Accessor.');
        }
        this.handleLastResponse(
            await this.client.delete(
                `${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}/${model[this.identifier]}`,
            ),
        ).data;
        return true;
    }

    /**
     * Get one model from a list of criterion AND an id.
     * This could be use to change the output of the model for example.
     *
     * @param criteria A list of criterion + an identifier value
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async findByCriteria(criteria: IdentifierCriteria<ID>, parentModel?: T): Promise<U> {
        if (!parentModel) {
            throw new SDKException('For a classic findByCriteria, use a classic Accessor.');
        }
        const idValue = criteria[this.identifier];
        delete criteria[this.identifier];
        const query = await this.buildQueryString(criteria);
        return this.handleLastResponse(
            await this.client.get<U>(
                `${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}/${idValue}?${query}`,
            ),
        ).data;
    }

    /**
     * Get some models from a list of criterion.
     * Criteria are an object (key/value) with key as string and value as string, number, boolean, or an array of those types.
     *
     * @param criteria A list of criterion
     * @param parentModel The parent model based on. Should contains the identifier value.
     */
    public async findAllByCriteria(criteria: Criteria, parentModel?: T): Promise<U[]> {
        if (!parentModel) {
            throw new SDKException('For a classic findByCriteria, use a classic Accessor.');
        }
        const query = await this.buildQueryString(criteria);
        return this.handleLastResponse(
            await this.client.get<U[]>(
                `${this.route}/${parentModel[this.identifierParent]}${this.modelRoute}?${query}`,
            ),
        ).data;
    }
}
