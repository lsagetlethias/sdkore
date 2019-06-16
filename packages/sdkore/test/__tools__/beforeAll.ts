import indexedDB from 'fake-indexeddb';
import FormDataLib from 'form-data';
import { Storage, StorageMock } from '../__utils__/mocks/StorageMock';

const exposingDesc: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    writable: true,
};

Object.defineProperty(global, 'VERSION', { value: 'MOCK' });

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'sessionStorage', {
        value: new StorageMock(),
        ...exposingDesc,
    });
    Object.defineProperty(window, 'localStorage', {
        value: new StorageMock(),
        ...exposingDesc,
    });
    Object.defineProperty(window, 'Storage', {
        value: Storage,
        ...exposingDesc,
    });
    Object.defineProperty(window, 'FormData', {
        value: class extends FormDataLib {
            public append(key: string, value: any, options?: FormDataLib.AppendOptions | string): void {
                let newValue = value;
                if (value && value instanceof Blob) {
                    newValue = Buffer.alloc(value.size);
                }
                super.append(key, newValue, options);
            }
        },
        ...exposingDesc,
    });
    Object.defineProperty(window, 'indexedDB', {
        value: indexedDB,
        ...exposingDesc,
    });
}

import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http'; //tslint:disable-line
import path from 'path';
import { FixturesLoader, MOCK_API_PASSWORD, MOCK_API_USER, MOCK_URL } from 'sdkore-test-maker';
import * as SDK from '../../src';

declare global {
    namespace NodeJS {
        interface Global {
            __pleaseHelp: boolean;
            client: SDK.Client;
            FixturesLoader: FixturesLoader;
        }
    }
}

global.FixturesLoader = FixturesLoader.getInstance(path.resolve(__dirname, '../__fixtures__/'));

SDK.setDebug();
SDK.setLogger(null);
SDK.addPropagator(
    new class extends SDK.AbstractPropagator {
        public propagate(data: any): void {
            // tslint:disable-next-line:no-console
            global.__pleaseHelp && console.error(data.originalError);
        }
    }(),
);

axios.defaults.adapter = httpAdapter;
axios.defaults.cache = false;
const client = (global.client = new SDK.Client({
    cachePolicy: new SDK.DefaultCachePolicy(new SDK.ArrayCache()),
    password: MOCK_API_PASSWORD,
    url: MOCK_URL,
    username: MOCK_API_USER,
}));
client.setRequestCache(false);

client.register();
