import { TestMaker } from 'sdkore-test-maker';
import { AbstractAccessor, NoCrud } from '../../src';

@NoCrud
class NoCrudAccessor extends AbstractAccessor {
    public constructor() {
        super('');
    }
}
new TestMaker({})
    .setNonCrud()
    .testBasicCrud('<no_namespace>', NoCrudAccessor as any)
    .make();
