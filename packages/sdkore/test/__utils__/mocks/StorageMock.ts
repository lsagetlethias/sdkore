export abstract class Storage {
    public abstract clear();

    public abstract getItem(key);

    public abstract setItem(key, value);

    public abstract removeItem(key);
}

export class SM extends Storage {
    public store = {};

    constructor() {
        super();
        this.store = {};
    }

    public clear() {
        this.store = {};
    }

    public getItem(key) {
        return this.store[key] || null;
    }

    public setItem(key, value) {
        this.store[key] = value.toString();
    }

    public removeItem(key) {
        delete this.store[key];
    }
}

/* Ensure property access feature from Storage */
export const StorageMock = new Proxy(SM, {
    construct(target: typeof SM): SM {
        return new Proxy(new target(), {
            enumerate(instance: SM): PropertyKey[] {
                return Object.keys(instance.store);
            },
            get(instance: SM, p: PropertyKey) {
                if (instance[p]) {
                    return instance[p];
                }
                return instance.getItem(p);
            },
            set(instance: SM, p: PropertyKey, value: any): boolean {
                instance.setItem(p, value);
                return true;
            },
            deleteProperty(instance: SM, p: PropertyKey): boolean {
                instance.removeItem(p);
                return true;
            },
            ownKeys(instance: SM): PropertyKey[] {
                return [...Object.keys(instance), ...Object.keys(instance.store)];
            },
            getOwnPropertyDescriptor(instance: SM, p: PropertyKey): PropertyDescriptor | undefined {
                return (
                    Object.getOwnPropertyDescriptor(instance.store, p) ||
                    Object.getOwnPropertyDescriptor(instance, p) ||
                    undefined
                );
            },
        });
    },
});
