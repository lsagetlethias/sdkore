import nock from 'nock';
import { AbstractAccessor, Headers, HeadersOnce, IModel } from '../../src';
import { MOCK_TOKEN, MOCK_URL } from '../__utils__/Const';

const headers = { wyndtest: 'TEST' };
@Headers(headers, ['delete'])
class HeadersAccessor extends AbstractAccessor<IModel> {
    constructor() {
        super('/test');
    }
}

class HeadersOnceAccessor extends AbstractAccessor<IModel> {
    constructor() {
        super('/test');
    }

    @HeadersOnce(headers)
    public read() {
        return super.read();
    }
}

const params: Array<[string, typeof AbstractAccessor]> = [
    ['@Headers', HeadersAccessor],
    ['@HeadersOnce', HeadersOnceAccessor],
    [
        'HeadersInline',
        Headers(
            headers,
            'delete',
        )(
            class extends AbstractAccessor<IModel> {
                constructor() {
                    super('/test');
                }
            },
        ),
    ],
];

params.forEach(([name, accessorClass]) => {
    describe(name, () => {
        let accessor: AbstractAccessor;

        beforeAll(async () => {
            accessor = new (accessorClass as any)();
            accessor.client.cache.set('token', MOCK_TOKEN);
        });

        it('should make a read with additional headers', async () => {
            expect.assertions(1);
            const scope = nock(MOCK_URL, { reqheaders: headers });
            scope.get('/test').reply(200, {});

            await expect(accessor.read()).resolves.not.toThrow();
            scope.done();
        });

        it('should make a delete without additional headers', async () => {
            global.__pleaseHelp = true;
            expect.assertions(1);
            const scope = nock(MOCK_URL, { badheaders: Object.keys(headers) });
            scope.delete('/test/0').reply(200, true as any);

            await expect(accessor.delete({ id: 0 })).resolves.not.toThrow();
            scope.done();
        });
    });
});
