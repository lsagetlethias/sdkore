import { IModel } from '../DTO';
import { IClient } from '../utils/client';

export type CriterionValue = string | number | boolean;

export interface Criteria {
    [Criterion: string]: CriterionValue | CriterionValue[];
}

/**
 * The base accessor. This abstract class can be used to implement any new accessor based on a model.
 */
export interface IAccessor<T extends IModel> {
    /**
     * Return the client maintained by the accessor.
     */
    readonly client: IClient;

    paginationMax: number;

    /**
     * Change the client by setting a new id after a register.
     */
    setClientId(clientId: symbol): void;

    /**
     * Create a model
     *
     * @param model The model to create
     * @async
     */
    create(model: T): Promise<T>;

    /**
     * Read all models
     * @async
     */
    read(): Promise<T[]>;

    /**
     * Read all models without pagination
     * This method is **DEPRECATED**
     *
     * @param criteria A optional list of criterion
     * @async
     * @deprecated Should not ever use this because of potential performance issues
     */
    readAll(criteria?: Criteria): Promise<T[]>;

    /**
     * Read all models and paginate through them
     *
     * @param page The starting page
     * @param paginationMax The max result by page
     * @param criteria A optional list of criterion
     * @async
     * @generator
     */
    readPaginated(page?: number, paginationMax?: number, criteria?: Criteria): AsyncIterableIterator<T[]>;

    /**
     * Read a single model by its identifier value
     *
     * @param idValue The model's identifier value (stringable value)
     * @async
     */
    readOne(idValue: any): Promise<T>;

    /**
     * Update a model. This model **should** contains an identifier value to be updated.
     *
     * @param model The model to update
     * @async
     */
    update(model: T): Promise<T>;

    /**
     * Delete a model. This model **should** contains an identifier value to be deleted.
     *
     * @param model The model to delete
     * @async
     */
    delete(model: T): Promise<boolean>;

    /**
     * Get one model from a list of criterion AND an id.
     * This could be use to change the output of the model for example.
     *
     * @param criteria A list of criterion + an identifier value
     * @async
     */
    findByCriteria(criteria: Criteria): Promise<T>;

    /**
     * Get some models from a list of criterion.
     * Criteria are an object (key/value) with key as string and value as string, number, boolean, or an array of those types.
     *
     * @param criteria A list of criterion
     * @async
     */
    findAllByCriteria(criteria: Criteria): Promise<T[]>;
}
