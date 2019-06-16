import axios from 'axios';
import nock from 'nock';
import { TestMaker, TestState } from 'sdkore-test-maker';
import { AbstractAccessor, Cancelable, IModel } from '../../src';
import { MOCK_TOKEN, MOCK_URL } from '../__utils__/Const';

class TestAccessor extends AbstractAccessor {
    public constructor() {
        super('/test');
    }

    @Cancelable
    public async readOne(id: number) {
        return super.readOne(id);
    }
}

new TestMaker({})
    .addMoreTest((namespace, state: TestState<any>) => {
        let accessor: TestAccessor;

        beforeAll(async () => {
            accessor = state.accessor as TestAccessor;
        });

        it('should work normaly if just one reqest was done', async () => {
            const fixture = { test: '', id: 1 };
            state.nock.scope.get('/test/1').reply(200, fixture);

            expect(await accessor.readOne(1)).toEqual(fixture);
        });

        // it('should canceled first request if there is a second call before the first one is finished', async done => {
        //     const fixture = { test: '', id: 1 };
        //     const mockfn = jest.fn();
        //     const scope = state.nock.detachedScope({ badheaders: ['Customer-Token'] }).persist(true);
        //     scope
        //         .get('/test/1')
        //         .delay(1000)
        //         .reply(200, fixture);

        //     accessor.readOne(1).catch(e => {
        //         mockfn();
        //         console.warn(e);
        //         scope.done();
        //         done();
        //     });

        //     expect(await accessor.readOne(1)).toEqual(fixture);
        //     expect(mockfn).toBeCalled();

        // accessor.readOne(1).catch(e => {
        //     console.warn('catch');
        //     mockfn();
        //     expect(e.originalError).toBeInstanceOf(axios.Cancel);
        // });
        // state.nock.scope.get('/test/1').reply(200, fixture);
        // expect(await accessor.readOne(1)).toEqual(fixture);
        // expect(mockfn).toBeCalled();
        // });
    })
    .testNothing('<no_namespace>', TestAccessor as any)
    .make();
