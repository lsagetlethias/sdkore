import { Canceler } from 'axios';
import { IClient } from '../utils/client/IClient';

interface AccessorCancelablePropertyDescriptor extends PropertyDescriptor {
    currentCanceler?: Canceler;
    client?: IClient;
}

/**
 * To apply on request to make them cancelable
 * @annotation
 */
export function Cancelable(
    _target: any,
    _key: string,
    descriptor: PropertyDescriptor,
): AccessorCancelablePropertyDescriptor {
    return {
        async value(...args: any[]) {
            if (this.currentCanceler) {
                this.currentCanceler();
            }
            const value = descriptor.value.call(this, ...args);
            this.currentCanceler = this.client.lastRequestCanceler;
            return value;
        },
    };
}
