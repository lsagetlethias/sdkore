import * as SDK from '../../src';

describe('Logger', () => {
    type methodsName = 'log' | 'warn' | 'info' | 'error';
    const methods: methodsName[] = ['log', 'warn', 'info', 'error'];
    const spies: { [P in methodsName]?: jest.SpyInstance } = {};

    beforeAll(() => {
        const logger = {
            log() {},
            info() {},
            warn() {},
            error() {},
        };
        SDK.setLogger(logger as any);
        methods.forEach(m => {
            spies[m] = jest.spyOn(logger, m);
        });
    });

    beforeEach(() => {
        SDK.Logger['inited'] = false; // hack
    });

    afterEach(() => {
        methods.forEach(m => {
            spies[m].mockReset();
        });
    });

    afterAll(() => {
        methods.forEach(m => {
            spies[m].mockRestore();
        });
    });

    methods.forEach(m => {
        it(`should ${m}`, () => {
            SDK.setDebug();
            SDK.Logger[m]('dummy', { foo: 'bar' });
            expect(spies[m]).toBeCalled();
        });

        it(`should not ${m} anything`, () => {
            SDK.setDebug(false);
            SDK.Logger[m]('dummy', { foo: 'bar' });
            expect(spies[m]).not.toBeCalled();
        });
    });

    it('should not be inited a second time', () => {
        expect(SDK.Logger['inited']).toBeFalsy();
        SDK.Logger.log('dummy');
        expect(SDK.Logger['inited']).toBeTruthy();
        const log = jest.fn();
        SDK.setLogger({ log } as any);
        SDK.Logger.log('dummy2');
        expect(log).not.toBeCalled();
        expect(SDK.Logger['inited']).toBeTruthy();
    });
});
