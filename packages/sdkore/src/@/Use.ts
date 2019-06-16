import { Trait } from '../Trait';

type Class = typeof Object;

/**
 * Implements the "use" keyword from PHP.
 *
 * @param trait The Trait implementation to use.
 * @returns {(clazz:Class)=>Class} The class "traited"
 *
 * @annotation
 */
export function Use<T extends typeof Trait>(trait: T): any {
    return (clazz: Class): Class => {
        copyProperties(clazz, trait);
        copyProperties(clazz.prototype, trait.prototype);
        return clazz;
    };
}

/**
 * Copy param from a source class instance to the target class instance.
 *
 * @param {object} target
 * @param {object} source
 */
function copyProperties(target: object = {}, source: object = {}): void {
    const ownPropertyNames = Object.getOwnPropertyNames(source);

    ownPropertyNames
        .filter(key => !/(prototype|name|constructor)/.test(key))
        .forEach(key => {
            const desc = Object.getOwnPropertyDescriptor(source, key);

            try {
                Object.defineProperty(target, key, desc);
            } catch {
                /* catch for IE11 - no op */
            }
        });
}
