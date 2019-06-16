import { Use } from '../@';
import { GlobalStore } from '../store/GlobalStore';
import { PropagatorAwareTrait } from './PropagatorAwareTrait';

/* istanbul ignore next: exceptions can be skipped */
/**
 * This is the default exception that should be thrown in the SDK.
 *
 * It provides a way to propagate any log automatically to whatever service you plug with.
 */
@Use(PropagatorAwareTrait)
export class SDKException extends Error {
    /**
     * Constructs the exception.
     */
    constructor(message: string, public originalError?: Error, data?: any) {
        super(message);

        if (GlobalStore.debug) {
            // TRAIT CALL IN CONSTRUCTOR
            PropagatorAwareTrait.prototype.propagate.call(this, { originalError, data });
        }
    }
}
