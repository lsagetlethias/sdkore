import { Trait, Use } from '../../src';

class MyTrait extends Trait {
    public foo() {
        return 42;
    }
}

@Use(MyTrait)
class MyClass {}

describe('@Use', () => {
    it('should be possible to call trait methods', () => {
        expect((new MyClass() as MyClass & MyTrait).foo()).toEqual(42);
    });
});
