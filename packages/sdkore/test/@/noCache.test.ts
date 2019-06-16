import nock from 'nock';
import { AbstractAccessor, IModel, NoCache } from '../../src';
import { MOCK_TOKEN, MOCK_URL } from '../__utils__/Const';

describe('@NoCache', () => {
    const testUrl = '/test';
    class TestAccessor extends AbstractAccessor<IModel> {
        constructor() {
            super(testUrl);
        }

        @NoCache
        public async read() {
            return super.read();
        }
    }
    let accessor: TestAccessor;

    beforeAll(async () => {
        accessor = new TestAccessor();
        accessor.client.setRequestCache(true);
        accessor.client.cache.set('token', MOCK_TOKEN);
    });

    it('should make two real network get requests for the same url', async () => {
        expect.assertions(2);
        const ret = 'FOO';
        const scope = nock(MOCK_URL)
            .get(testUrl)
            .reply(200, ret);
        expect(await accessor.read()).toEqual(ret);
        scope.done();

        // we expect it to call try calling the network. So we don't initiate any network mock.
        await expect(accessor.read()).rejects.toThrow();
    });
});
