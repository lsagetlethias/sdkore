import { AbstractAccessor } from '../DAO';
import { HeadersList } from '../utils/client';

/**
 * Get and compute property descriptors from object and ancestors.
 * Will skip the first ancestor, Object.
 */
function inheritedProperties(obj: object): { [k: string]: PropertyDescriptor } {
    const desc: PropertyDescriptor[][] = [];
    let i = 0;
    while (obj) {
        desc[i] = [];
        Object.getOwnPropertyNames(obj).forEach(p => (desc[i][p] = Object.getOwnPropertyDescriptor(obj, p)));
        obj = Object.getPrototypeOf(obj);
        i++;
    }

    desc.pop(); // remove Object descriptor
    let ret = {};
    desc.reverse().forEach(p => (ret = { ...p, ...ret }));
    return ret;
}

/**
 * Add custom headers to axios before a call and remove it directly after.
 */
function addHeaders(descriptor: PropertyDescriptor, headers: HeadersList): PropertyDescriptor {
    return {
        ...descriptor,
        async value(this: AbstractAccessor, ...args: any[]) {
            this.client.addHeaders(headers);

            try {
                return await descriptor.value.call(this, args);
            } finally {
                this.client.removeHeaders(Object.keys(headers));
            }
        },
    };
}

/**
 * Add Headers to all **but** the chosen methods of an Accessor.
 *
 * Headers will be set to axios just before the method call and removed right after.
 *
 * @param headers An object of key-value headers to add.
 * @param methods An array of string or a string. A string should be a valid method name of the class decorated.
 *
 * @annotation Class accessor
 */
export const Headers = <M extends string>(headers: HeadersList, methods: M[] | M = []) => <
    T extends (new () => { [K in M]: any }) & typeof AbstractAccessor
>(
    target: T,
): T => {
    if (typeof methods === 'string') {
        methods = [methods];
    }
    const properties = inheritedProperties(target.prototype);
    Object.keys(properties)
        .filter(key => !/(constructor)/.test(key) && typeof target.prototype[key] === 'function')
        .filter((key: M) => !methods.includes(key))
        .forEach(key => {
            try {
                Object.defineProperty(target.prototype, key, addHeaders(properties[key], headers));
            } catch {
                /* catch for IE11 - no op */
            }
        });
    return target;
};

/**
 * Add Headers to a specific methods of an Accessor.
 *
 * @annotation Method accessor
 */
export const HeadersOnce = (headers: HeadersList) => <T extends AbstractAccessor>(
    target: T,
    propertyKey: keyof T,
    descriptor: PropertyDescriptor,
): PropertyDescriptor => {
    return addHeaders(descriptor, headers);
};
