import { AbstractAccessor } from '../DAO';

/**
 * This annotation will help when an accessor GET method need to disable cache.
 *
 * The customer token is get from client's cache set in the accessor.
 *
 * @this AbstractAccessor
 * @annotation
 */
export function NoCache<T>(
    _target: AbstractAccessor<T>,
    _key: string,
    descriptor: PropertyDescriptor,
): PropertyDescriptor {
    return {
        async value(this: AbstractAccessor, ...args: any[]) {
            const prevCache = this.client.isRequestCache();
            this.client.setRequestCache(false);
            try {
                return await descriptor.value.call(this, ...args);
            } finally {
                this.client.setRequestCache(prevCache);
            }
        },
    };
}
