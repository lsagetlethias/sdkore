/**
 * To apply on request to make them cancelable
 * @annotation
 */
export function Cancelable(target, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    return {
        async value(...args) {
            if (this.currentCanceler) {
                this.currentCanceler();
            }
            const value = descriptor.value.call(this, ...args);
            this.currentCanceler = this.client.lastRequestCanceler;
            return value;
        },
    };
}
