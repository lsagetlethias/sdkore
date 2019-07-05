import { SDKException } from './SDKException';

/* istanbul ignore next: exceptions can be skipped */
/**
 * This exception is thrown whenever a request failed for whatever reason.
 */
export class RequestException extends SDKException {
    public errorCode: number;
    constructor(message: string, originalError?: Error, errorCode?: number, data?: any) {
        super(`${message} (status code ${errorCode})`, originalError, data);

        this.errorCode = errorCode;
    }
}
