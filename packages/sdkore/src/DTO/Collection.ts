import { IModel } from './IModel';

/**
 * When you need to manipulate data after a request, you can use a collection to wrap those data and do it.
 *
 * A collection can be reset to get the original data after any sorting or filtering.
 */
export class Collection<T extends IModel> {
    private readonly _data: T[];
    private dataTemp: T[];

    /**
     * Construct a collection by wrapping a set of data.
     *
     * @param data The typed data array to wrap and manipulate
     */
    constructor(data: T[]) {
        this._data = [...data];
        this.dataTemp = [...data];
    }

    private testValue(value: any, source: any, property: keyof T): boolean {
        const test = source[property];

        if ('boolean' === typeof value && 'boolean' === typeof test) {
            return value === test;
        }

        if ('string' === typeof test) {
            const regex = new RegExp(`${value}`, 'i');
            return regex.test(test);
        }

        if ('number' === typeof test) {
            return parseFloat(value) === test;
        }

        return false;
    }

    private getLang(): string {
        let lang = 'fr';
        if (navigator && navigator.language) {
            lang = navigator.language;
        } /* istanbul ignore next: nodejs specific checking */ else if (process) {
            const env = process.env;
            lang = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES || lang;
        }

        return lang.substr(0, 2);
    }

    /**
     * Return the modified data set
     */
    public get data(): T[] {
        return this.dataTemp;
    }

    /**
     * Return the length of the modified data
     */
    public get length(): number {
        return this.dataTemp.length;
    }

    /**
     * Sort the data set by a specific property of its type.
     *
     * The sorting can be ascending (by default) or descending.
     *
     * Any null data will be put in last position in any case.
     *
     * @param property The property key to sort by. It depends from the type of the data source
     * @param direction Ascending by default
     */
    public sortBy(property: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
        const lang = this.getLang();
        this.dataTemp = this.dataTemp.sort((a, b) => {
            const asc = 'asc' === direction;
            let compare = 0;

            // null is always sorted on last position
            if (null === a[property]) {
                return 1;
                // tslint:disable-next-line:no-else-after-return
            } else if (null === b[property]) {
                return -1;
            }

            if ('string' === typeof a[property]) {
                try {
                    compare = a[property].localeCompare(b[property], lang, { sensitivity: 'base' });
                } catch {
                    // old browser
                }
            } else {
                if (a[property] === b[property]) {
                    return 0;
                }
                compare = a[property] > b[property] ? 1 : -1;
            }

            if (asc) {
                return compare;
            }
            return -compare;
        });

        return this;
    }

    /**
     * Filter the data set by a value, and optionally by targeting a specific property to filter on.
     *
     * The value can be anything and the filter will search on every property of every object of the data set.
     *
     * On the other hand, when a property key is specified (specific to the data type), the value type *must* match the
     * type of the property targeted.
     *
     * @param value The value to filter with.
     * @param property The property key to filter by. It depends from the type of the data source
     */
    public filter<K extends keyof T>(value: T[K], property?: K): this {
        this.dataTemp = this.dataTemp.filter(source => {
            if ('undefined' !== typeof property) {
                return this.testValue(value, source, property);
            }

            for (const p in source) {
                if (Object.prototype.hasOwnProperty.call(source, p)) {
                    const ret = this.testValue(value, source, p);
                    if (ret) {
                        return ret;
                    }
                }
            }

            return false;
        });
        return this;
    }

    /**
     * Reset the data set to its original state.
     */
    public reset(): this {
        this.dataTemp = [...this._data];
        return this;
    }
}
