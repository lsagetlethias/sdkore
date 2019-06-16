import { AbstractAccessor } from '../../src';

class ChildAccessor extends AbstractAccessor<any> {
    constructor(route: string = '', paginationMax: number = 50) {
        super(route, 'id', paginationMax);
    }
}

describe('the AbstractAccessor paginationMax prop', () => {
    let childAccessorWithPaginateMax: ChildAccessor;
    let childAccessor: ChildAccessor;

    beforeAll(async () => {
        childAccessorWithPaginateMax = new ChildAccessor('', 100);
        childAccessor = new ChildAccessor();
    });

    it('should have a paginationMax different from AbstractAccessor default prop', () => {
        expect(childAccessorWithPaginateMax.paginationMax).not.toBe(childAccessor.paginationMax);
    });
});
