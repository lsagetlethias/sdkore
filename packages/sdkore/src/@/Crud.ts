/* istanbul ignore file: Annotations are pretty straigtforward */

import { AbstractAccessor } from '../DAO';
import { IModel } from '../DTO';
import { ClassExcept, ClassOnly, ClassType } from '../utils/Types';

type ReadOne = 'readOne' | 'findByCriteria';
type ReadAll = 'read' | 'readPaginated' | 'findAllByCriteria';

function deleteReadOneProperties<T extends typeof AbstractAccessor>(c: T) {
    delete c.prototype.readOne;
    delete c.prototype.findByCriteria;
    return c;
}

function deleteReadAllProperties<T extends typeof AbstractAccessor>(c: T) {
    delete c.prototype.read;
    delete c.prototype.readPaginated;
    delete c.prototype.findAllByCriteria;
    return c;
}

/**
 * Remove the create method from the crud.
 *
 * @annotation
 */
export function NoCreate<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    delete c.prototype.create;
    return c;
}

/**
 * Remove the readOne method from the crud.
 *
 * @annotation
 */
export function NoReadOne<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    return deleteReadOneProperties(c);
}

/**
 * Remove the read method from the crud.
 *
 * @annotation
 */
export function NoRead<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    return deleteReadAllProperties(c);
}

/**
 * Make the crud read only (without create, update, delete).
 *
 * @annotation
 */
export function ReadOnly<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    return NoCreate(NoUpdate(NoDelete(c)));
}

/**
 * Make the crud write only (without read, readOne)
 *
 * @annotation
 */
export function WriteOnly<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    return NoRead(NoReadOne(c));
}

/**
 * Remove the update method from the crud.
 *
 * @annotation
 */
export function NoUpdate<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    delete c.prototype.update;
    return c;
}

/**
 * Remove the delete method from the crud.
 *
 * @annotation
 */
export function NoDelete<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    delete c.prototype.delete;
    return c;
}

/**
 * Remove full crud.
 *
 * @annotation
 */
export function NoCrud<T extends ClassType<AbstractAccessor<any, any>>>(c: T) {
    return ReadOnly(WriteOnly(c));
}

//#region Mutation functions

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _NoCreate<M extends IModel, T extends AbstractAccessor<M>>(c: ClassType<T>): ClassExcept<T, 'create'> {
    return NoCreate(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _NoReadOne<M extends IModel, T extends AbstractAccessor<M>>(c: ClassType<T>): ClassExcept<T, ReadOne> {
    return NoReadOne(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _NoRead<M extends IModel, T extends AbstractAccessor<M>>(c: ClassType<T>): ClassExcept<T, ReadAll> {
    return NoRead(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _ReadOnly<M extends IModel, T extends AbstractAccessor<M>>(
    c: ClassType<T>,
): ClassOnly<T, ReadOne | ReadAll> {
    return ReadOnly(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _WriteOnly<M extends IModel, T extends AbstractAccessor<M>>(
    c: ClassType<T>,
): ClassExcept<T, ReadOne | ReadAll> {
    return WriteOnly(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _NoUpdate<M extends IModel, T extends AbstractAccessor<M>>(c: ClassType<T>): ClassExcept<T, 'update'> {
    return NoUpdate(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _NoDelete<M extends IModel, T extends AbstractAccessor<M>>(c: ClassType<T>): ClassExcept<T, 'delete'> {
    return NoUpdate(c);
}

/**
 * Mutation function. Please use the annotation instead.
 *
 * @deprecated Will be removed when https://github.com/Microsoft/TypeScript/issues/4881 is solved
 */
export function _NoCrud<T extends AbstractAccessor<never>>(
    c: ClassType<T>,
): ClassExcept<T, 'create' | ReadOne | ReadAll | 'update' | 'delete'> {
    return NoCrud(c);
}

//#endregion
