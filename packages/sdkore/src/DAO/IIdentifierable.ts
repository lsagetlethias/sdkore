import { Criteria } from './IAccessor';

export type IdentifierCriteria<ID extends string = 'id'> = Criteria & { [K in ID]?: K extends 'id' ? number : unknown };

/**
 * The base accessor. This abstract class can be used to implement any new accessor based on a model.
 */
export interface IIdentifierable<ID extends string = 'id'> {
    /**
     * Returns the actual identifier used to manipulate the model (id, uuid, ...)
     */
    getIdentifier(): ID;
}
