import axios from 'axios';
import nock from 'nock';
import { AbstractAccessor, ArrayCache, Client, DefaultCachePolicy } from '../../src';
import { GlobalStore } from '../../src/store/GlobalStore';
import { REQUEST_HEADERS } from '../../src/utils/Const';
import { MOCK_API_PASSWORD, MOCK_API_USER, MOCK_CACHE_TIME, MOCK_TOKEN, MOCK_URL } from '../__utils__/Const';

describe('Client', () => {
    it('should not get an unknown instance', () => {
        expect(() => Client.getInstance(Symbol())).toThrow();
    });

    it('should get a previous registered instance with good uid', () => {
        const first = new Client({
            password: MOCK_API_PASSWORD,
            tokenExpiration: 1,
            url: MOCK_URL,
            username: MOCK_API_USER,
        });
        const firstUid = first.register();

        const accessor = new class extends AbstractAccessor {
            constructor() {
                super('');
            }
        }();

        const second = new Client({
            password: 'dummy',
            url: 'http://dummy',
            username: 'dummy',
        });
        const secondClientId = second.register();

        expect(Client.getInstance(firstUid)).toBe(first);
        expect(Client.getInstance(GlobalStore.lastClientId)).toBe(second);
        expect(accessor.client).toBe(first);

        accessor.setClientId(secondClientId);

        expect(accessor.client).toBe(second);
    });

    it('should get a previous request data from cache without calling server', async () => {
        Date.now = jest.fn(() => MOCK_CACHE_TIME - MOCK_CACHE_TIME);
        delete axios.defaults.cache;

        const client = new Client({
            cachePolicy: new DefaultCachePolicy(new ArrayCache(), MOCK_CACHE_TIME),
            password: MOCK_API_PASSWORD,
            url: MOCK_URL,
            username: MOCK_API_USER,
        });
        client.cache.set('token', MOCK_TOKEN);

        const test = 'IAMATEST';
        const fnScope = () =>
            nock(MOCK_URL)
                .get(/\/dummy\?.*/)
                .reply(200, test);

        // 1st request is real and use the mock
        const scope = fnScope();
        expect((await client.request(`${MOCK_URL}/dummy?a&b`, 'GET')).data).toEqual(test);
        scope.done();

        // 2nd request is cached, we don't need mock
        expect((await client.request(`${MOCK_URL}/dummy?b&a`, 'GET')).data).toEqual(test);

        // cache invalidation
        Date.now = jest.fn(() => MOCK_CACHE_TIME + 1);
        const scopeAgain = fnScope();
        // 3rd request is real again and refresh cache because it's too old. Use the mock again.
        expect((await client.request(`${MOCK_URL}/dummy?b&a`, 'GET')).data).toEqual(test);
        scopeAgain.done();
    });

    it('should get again if any alteration is made on a resource (strict policy)', async () => {
        Date.now = jest.fn(() => MOCK_CACHE_TIME - MOCK_CACHE_TIME);
        delete axios.defaults.cache;

        const client = new Client({
            cachePolicy: new DefaultCachePolicy(new ArrayCache(), MOCK_CACHE_TIME, true),
            password: MOCK_API_PASSWORD,
            url: MOCK_URL,
            username: MOCK_API_USER,
        });
        client.cache.set('token', MOCK_TOKEN);

        const test = 'IAMATEST';
        const fnGetScope = () =>
            nock(MOCK_URL)
                .get(/\/strict_test(\?|\/)?.*/)
                .reply(200, test);

        const fnPostScope = () =>
            nock(MOCK_URL)
                .post(/\/strict_test(\?|\/)?.*/)
                .reply(201);

        // get and cache
        const scopeGET_1 = fnGetScope();
        expect((await client.get(`${MOCK_URL}/strict_test/getMeAllYouHave`)).data).toEqual(test);
        scopeGET_1.done();

        // post and invalidate cache
        const scopePOST = fnPostScope();
        expect((await client.post(`${MOCK_URL}/strict_test`)).status).toEqual(201);
        scopePOST.done();

        // cache is invalidated so get again and cache
        const scopeGET_2 = fnGetScope();
        expect((await client.get(`${MOCK_URL}/strict_test/getMeAllYouHave`)).data).toEqual(test);
        scopeGET_2.done();

        // hit cache and get from it
        expect((await client.get(`${MOCK_URL}/strict_test/getMeAllYouHave`)).data).toEqual(test);

        // malformed resource
        await expect(client.get(`${MOCK_URL}`)).rejects.toThrow();
    });

    it('should use the token given to its constructor', async () => {
        const token = 'thisIsAsecrett0k3n';
        const axiosInstance = axios.create();
        jest.spyOn(axios, 'create').mockReturnValue(axiosInstance);

        const client = new Client({
            token,
            url: MOCK_URL,
        });

        nock(MOCK_URL)
            .get(/\/dummy/)
            .reply(200, 'toto');

        await client.get(`${MOCK_URL}/dummy`);

        expect(axiosInstance.defaults.headers.common[REQUEST_HEADERS.AUTHORIZATION]).toBe(`Bearer ${token}`);
    });
});
