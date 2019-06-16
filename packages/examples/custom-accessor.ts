import { AbstractAccessor, IModel, NoDelete, NoRead } from 'sdkore';

/**
 * CustomAccessor
 *
 * If the SDK doesn't implements what you need (in a specific way) you can override the default behavior by adding
 * your own set of accessors.
 * It will build a basic crud based on a specific route. See AbstractAccessor for more detail.
 */
class FooAccessor extends AbstractAccessor<any> {
    constructor() {
        super('/foo');
    }
}

// ---

/**
 * CustomAccessor - Model
 *
 * For development convenience in Typescript, you can write a model matching you API data structure. This model always
 * have an id by default (with IModel) and can be used with you custom accessor to make your auto-complete habit odly
 * satisfied ^_^.
 */
interface BazModel extends IModel {
    readonly foo: string;
}

class BazAccessor extends AbstractAccessor<BazModel> {
    constructor() {
        super('/baz');
    }
}

// ---

/**
 * CustomAccessor - Identifier choice
 *
 * Sometimes, some API resources are not working with the classical `id` identifier and you need to adapt your accessor for it.
 * Could be `uuid` or whatever you need. The crud will adapt to it by choosing the good property on your model.
 */
class QuxAccessor extends AbstractAccessor<any, 'uuid'> {
    constructor() {
        super('/qux', 'uuid');
    }
}

// ---

/**
 * CustomAccessor - CRUD Decorators
 *
 * If you need to disable some features from your crud, the SDK provides a list of decorators that can helps you achieve that.
 * `@NoCreate`  = disable POST method from the accessor
 * `@NoReadOne` = disable GET-id like methods from the accessor (including search with criteria)
 * `@NoRead`    = disable GET like methods from the accessor (including search with criteria and pagination)
 * `@NoUpdate`  = disable PUT method from the accessor
 * `@NoDelete`  = disable DELETE method from the accessor
 * `@ReadOnly`  = `@NoCreate` + `@NoUpdate` + `@NoDelete`
 * `@WriteOnly` = `@NoReadOne` + `@NoRead`
 * `@NoCrud`    = `@ReadOnly` + `@WriteOnly`
 * See /@/Crud for more detail.
 */
@NoRead
@NoDelete
class QuuxAccessor extends AbstractAccessor<any> {
    constructor() {
        super('/quux');
    }
}
