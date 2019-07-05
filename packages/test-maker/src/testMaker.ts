import { AbstractAccessor, AbstractCombinedAccessor, Typeof } from 'sdkore';
import { FIXTURE_ERROR_ID, MOCK_TOKEN } from './Const';
import { FixtureNamespace } from './FixtureNamespace';
import { Fixture, FixturesLoader } from './FixturesLoader';
import { NockMock, NockRoutes, RouteList } from './NockMock';

type AnyAccessor = AbstractAccessor<any, string>;
type AnyCombinedAccessor = AbstractCombinedAccessor<any, any, string, string>;
type Fn = () => void;

export interface TestState<
    TAccessor extends AnyAccessor | AnyCombinedAccessor,
    TNockRoutes extends NockRoutes = NockRoutes
> {
    accessor?: TAccessor;
    fixtures?: Fixture[];
    nock?: TNockRoutes;
    idName?: string;
    parentFixtures?: Fixture[];
    idParentName?: string;
}

export type AdditionalTest<TAccessor extends AnyAccessor> = (
    namespace: FixtureNamespace | [FixtureNamespace, FixtureNamespace?],
    state: TestState<TAccessor>,
) => void;
type Stack = Array<(cb: Fn) => Fn>;
type AdditionalTestStack = Array<AdditionalTest<AnyAccessor>>;

export class InnerMaker {
    public constructor(private stack: Stack, private executor: Fn) {}

    public make(): void {
        let first = true;
        let bound: Fn;
        for (let i = this.stack.length - 1; i >= 0; i--) {
            const fn = this.stack[i];
            if (first) {
                bound = fn.bind(null, this.executor)();
                first = false;
            } else {
                bound = fn.bind(null, bound)();
            }
        }

        (bound || this.executor)();

        this.stack = [];
        this.executor = null;
    }
}

export class TestMaker {
    protected stack: Stack = [];
    protected executor: Fn;
    protected uncreatable = false;
    protected unreadable = false;
    protected unreadAllable = false;
    protected unupdatable = false;
    protected undeletable = false;
    protected additionalTestStack: AdditionalTestStack = [];
    protected additionalBeforeAllStack: Fn[] = [];
    protected additionalBeforeEachStack: Fn[] = [];
    protected additionalAfterAllStack: Fn[] = [];
    protected additionalAfterEachStack: Fn[] = [];

    public constructor(
        protected readonly routeList: RouteList,
        protected readonly nockRoutesClass: typeof NockRoutes = NockRoutes,
    ) {}

    protected get innerMaker(): InnerMaker {
        const i = new InnerMaker(this.stack, this.executor);
        this.stack = [];
        this.executor = null;
        this.uncreatable = false;
        this.unreadable = false;
        this.unreadAllable = false;
        this.unupdatable = false;
        this.undeletable = false;
        return i;
    }

    public setUncreatable(): this {
        this.uncreatable = true;
        return this;
    }

    public setUnreadable(): this {
        this.unreadable = true;
        return this;
    }

    public setUnreadAllable(): this {
        this.unreadAllable = true;
        return this;
    }

    public setUnupdatable(): this {
        this.unupdatable = true;
        return this;
    }

    public setUndeletable(): this {
        this.undeletable = true;
        return this;
    }

    public setNonCrud(): this {
        this.uncreatable = true;
        this.unreadable = true;
        this.unreadAllable = true;
        this.unupdatable = true;
        this.undeletable = true;
        return this;
    }

    public setReadOnly(readAllOnly = false): this {
        this.uncreatable = true;
        this.unupdatable = true;
        this.unreadable = readAllOnly;
        this.undeletable = true;
        return this;
    }

    public addMoreTest<TAccessor extends AnyAccessor>(test: AdditionalTest<TAccessor>): this {
        this.additionalTestStack.push(test);
        return this;
    }

    public testNothing<TAccessor extends AnyAccessor>(namespace: FixtureNamespace, accessorClass: Typeof<TAccessor>) {
        this.executor = _makeNothing(
            this.routeList,
            this.nockRoutesClass,
            namespace,
            accessorClass,
            this.additionalTestStack,
            this.additionalBeforeAllStack,
            this.additionalBeforeEachStack,
            this.additionalAfterAllStack,
            this.additionalAfterEachStack,
        );
        return this.innerMaker;
    }

    public testBasicCrud<TAccessor extends AnyAccessor>(namespace: FixtureNamespace, accessorClass: Typeof<TAccessor>) {
        this.executor = _makeBasicCrudTests(
            this.routeList,
            this.nockRoutesClass,
            namespace,
            accessorClass,
            this.uncreatable,
            this.unreadable,
            this.unreadAllable,
            this.unupdatable,
            this.undeletable,
            this.additionalTestStack,
            this.additionalBeforeAllStack,
            this.additionalBeforeEachStack,
            this.additionalAfterAllStack,
            this.additionalAfterEachStack,
        );
        return this.innerMaker;
    }

    public testCombinedCrud<TCombinedAccessor extends AnyCombinedAccessor>(
        namespace: FixtureNamespace,
        namespacePlus: FixtureNamespace,
        accessorClass: Typeof<TCombinedAccessor>,
    ) {
        this.executor = _makeCombinedCrudTests(
            this.routeList,
            this.nockRoutesClass,
            namespace,
            namespacePlus,
            accessorClass,
            this.uncreatable,
            this.unreadable,
            this.unreadAllable,
            this.unupdatable,
            this.undeletable,
            this.additionalTestStack,
            this.additionalBeforeAllStack,
            this.additionalBeforeEachStack,
            this.additionalAfterAllStack,
            this.additionalAfterEachStack,
        );
        return this.innerMaker;
    }
}

function __doSetup<TAccessor extends AnyAccessor | AnyCombinedAccessor>(
    testState: TestState<TAccessor>,
    routeList: RouteList,
    nockRoutesClass: typeof NockRoutes,
    namespaces: [FixtureNamespace, FixtureNamespace?],
    accessorClass: Typeof<TAccessor>,
    additionalTestStack: AdditionalTestStack,
    additionalBeforeAllStack: Fn[],
    additionalBeforeEachStack: Fn[],
    additionalAfterAllStack: Fn[],
    additionalAfterEachStack: Fn[],
) {
    // BEFORE ALL
    [
        async () => {
            testState.accessor = new accessorClass();
            testState.idName = testState.accessor.getIdentifier();
            testState.fixtures = (await FixturesLoader.getInstance().load(namespaces[0], true, true)).map(fixture => ({
                ...fixture,
                '@idName': testState.idName,
            }));
            testState.nock = NockMock.init(routeList, nockRoutesClass);

            // combined
            if (namespaces.length === 2) {
                const parentNamespace = namespaces[1];
                testState.idParentName = (testState.accessor as AnyCombinedAccessor).getIdentifierParent();
                testState.parentFixtures = (await FixturesLoader.getInstance().load(parentNamespace, true, true)).map(
                    fixture => ({
                        ...fixture,
                        '@idName': testState.idParentName,
                    }),
                );
            }
        },
        ...additionalBeforeAllStack,
    ].forEach(beforeAll);

    // BEFORE EACH
    [
        async () => {
            await testState.accessor.client.cache.clear();
            await testState.accessor.client.cache.set('token', MOCK_TOKEN);
        },
        ...additionalBeforeEachStack,
    ].forEach(beforeEach);

    // AFTER ALL
    [
        () => {
            NockMock.kill();
        },
        ...additionalAfterAllStack,
    ].forEach(afterAll);

    // AFTER EACH
    [
        () => {
            // testState.accessor.client.setRequestCache(false);
            testState.nock.scope.done();
            NockMock.clean();
        },
        ...additionalAfterEachStack,
    ].forEach(afterEach);

    if (additionalTestStack && additionalTestStack.length) {
        describe('Custom additional tests', () => {
            for (const additionalTest of additionalTestStack) {
                additionalTest(namespaces.length === 2 ? namespaces : namespaces[0], testState);
            }
        });
    }
}

function _makeNothing<TAccessor extends AnyAccessor>(
    routeList: RouteList,
    nockRoutesClass: typeof NockRoutes,
    namespace: FixtureNamespace,
    accessorClass: Typeof<TAccessor>,
    additionalTestStack?: AdditionalTestStack,
    additionalBeforeAllStack?: Fn[],
    additionalBeforeEachStack?: Fn[],
    additionalAfterAllStack?: Fn[],
    additionalAfterEachStack?: Fn[],
): Fn {
    return describe.bind(null, `[makeNothing] ${namespace.toUpperCase()} (prebuilt)`, () => {
        describe(`${accessorClass.name}`, () => {
            const testState: TestState<TAccessor> = {};

            __doSetup(
                testState,
                routeList,
                nockRoutesClass,
                [namespace],
                accessorClass,
                additionalTestStack,
                additionalBeforeAllStack,
                additionalBeforeEachStack,
                additionalAfterAllStack,
                additionalAfterEachStack,
            );
        });
    });
}

function _makeBasicCrudTests<TAccessor extends AnyAccessor>(
    routeList: RouteList,
    nockRoutesClass: typeof NockRoutes,
    namespace: FixtureNamespace,
    accessorClass: Typeof<TAccessor>,
    uncreatable = false,
    unreadable = false,
    unreadAllable = false,
    unupdatable = false,
    undeletable = false,
    additionalTestStack?: AdditionalTestStack,
    additionalBeforeAllStack?: Fn[],
    additionalBeforeEachStack?: Fn[],
    additionalAfterAllStack?: Fn[],
    additionalAfterEachStack?: Fn[],
): Fn {
    return describe.bind(null, `[makeBasicCrudTests] ${namespace.toUpperCase()} (prebuilt)`, () => {
        describe(`${accessorClass.name}`, () => {
            const testState: TestState<TAccessor> = {};
            let accessor: TAccessor;
            let fixtures: Fixture[];
            let nock: NockRoutes;
            let idName: string;

            __doSetup(
                testState,
                routeList,
                nockRoutesClass,
                [namespace],
                accessorClass,
                additionalTestStack,
                additionalBeforeAllStack,
                additionalBeforeEachStack,
                additionalAfterAllStack,
                additionalAfterEachStack,
            );

            beforeAll(() => {
                accessor = testState.accessor;
                fixtures = testState.fixtures;
                nock = testState.nock;
                idName = testState.idName;
            });

            if (uncreatable) {
                it(`should not creates a ${namespace}`, async () => {
                    await expect(accessor.create(fixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should creates a ${namespace}`, async () => {
                    const fixture = fixtures[0];
                    nock.initCreateRoutes(namespace);
                    expect(await accessor.create(fixture)).toEqual(fixture);
                });
            }

            if (unreadable) {
                it(`should not gets a ${namespace}`, async () => {
                    await expect(accessor.readOne((fixtures[0] && fixtures[0].id) || null)).rejects.toThrow();
                });

                it('should not find one by criteria', async () => {
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                        [idName]: 1,
                    };
                    await expect(accessor.findByCriteria(criteria)).rejects.toThrow();
                });
            } else {
                it(`should gets a ${namespace}`, async () => {
                    const fixture = fixtures[0];
                    nock.initReadRoutes(fixture);
                    expect(await accessor.readOne(fixture[idName])).toEqual(fixture);
                });
                it('should find one by criteria', async () => {
                    const fixture = fixtures[0];
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                        [idName]: fixture[idName],
                    };
                    nock.initFindByCriteriaRoutes(fixture, { ...criteria });
                    expect(await accessor.findByCriteria(criteria)).toEqual(fixture);
                });
            }

            if (unreadAllable) {
                it(`should not gets all ${namespace}`, async () => {
                    await expect(accessor.read()).rejects.toThrow();
                });

                it('should not find all by criteria', async () => {
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                        [idName]: 1,
                    };
                    await expect(accessor.findAllByCriteria(criteria)).rejects.toThrow();
                });

                it(`should not gets paginated ${namespace}`, async () => {
                    await expect(accessor.readPaginated().next()).rejects.toThrow();
                });
            } else {
                it(`should gets all ${namespace}s`, async () => {
                    nock.initReadAllRoutes(fixtures);
                    expect(await accessor.read()).toEqual(fixtures);
                });

                it('should find all by criteria', async () => {
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                    };
                    nock.initFindAllByCriteriaRoutes(fixtures, { ...criteria });
                    expect(await accessor.findAllByCriteria(criteria)).toEqual(fixtures);
                });

                it('should read with pagination of 1 item by page', async () => {
                    nock.initReadPaginatedRoutes(fixtures);
                    let iteration = 0;
                    accessor.paginationMax = 413;
                    expect(accessor.paginationMax).toBeNull();
                    accessor.paginationMax = -134;
                    expect(accessor.paginationMax).toBe(1);
                    for await (const data of accessor.readPaginated(1, 1, {})) {
                        expect(data).toEqual([fixtures[iteration]]);
                        iteration++;
                    }
                });
            }

            if (unupdatable) {
                it(`should not updates a ${namespace}`, async () => {
                    await expect(accessor.update(fixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should updates a ${namespace}`, async () => {
                    const fixture = fixtures[0];
                    nock.initUpdateRoutes(fixture);
                    expect(await accessor.update(fixture)).toEqual(fixture);
                });
            }

            if (undeletable) {
                it(`should not deletes a ${namespace}`, async () => {
                    await expect(accessor.delete(fixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should deletes a ${namespace}`, async () => {
                    const fixture = fixtures[0];
                    nock.initDeleteRoutes(fixture);
                    expect(await accessor.delete(fixture as any)).toBeTruthy();
                });
            }

            it(`should not manipulates an unknown ${namespace}`, async () => {
                nock.initWrongRoutes(namespace, 'get')
                    .initWrongRoutes(namespace, 'put')
                    .initWrongRoutes(namespace, 'delete');
                const wrongModel = { [idName]: FIXTURE_ERROR_ID };

                await Promise.all([
                    expect(accessor.readOne(FIXTURE_ERROR_ID)).rejects.toThrow(),
                    expect(accessor.update(wrongModel)).rejects.toThrow(),
                    expect(accessor.delete(wrongModel)).rejects.toThrow(),
                ]);
            });
        });
    });
}

function _makeCombinedCrudTests<TCombinedAccessor extends AnyCombinedAccessor>(
    routeList: RouteList,
    nockRoutesClass: typeof NockRoutes,
    parentNamespace: FixtureNamespace,
    namespace: FixtureNamespace,
    accessorClass: Typeof<TCombinedAccessor>,
    uncreatable = false,
    unreadable = false,
    unreadAllable = false,
    unupdatable = false,
    undeletable = false,
    additionalTestStack?: AdditionalTestStack,
    additionalBeforeAllStack?: Fn[],
    additionalBeforeEachStack?: Fn[],
    additionalAfterAllStack?: Fn[],
    additionalAfterEachStack?: Fn[],
): Fn {
    return describe.bind(null, `[makeCombinedCrudTests] ${parentNamespace.toUpperCase()} (prebuilt)`, () => {
        describe(`${accessorClass.name}`, () => {
            const testState: TestState<TCombinedAccessor> = {};
            let accessor: TCombinedAccessor;
            let fixtures: Fixture[];
            let parentFixtures: Fixture[];
            let nock: NockRoutes;
            let idName: string;
            let idParentName: string;

            __doSetup(
                testState,
                routeList,
                nockRoutesClass,
                [namespace, parentNamespace],
                accessorClass,
                additionalTestStack,
                additionalBeforeAllStack,
                additionalBeforeEachStack,
                additionalAfterAllStack,
                additionalAfterEachStack,
            );

            beforeAll(() => {
                accessor = testState.accessor;
                fixtures = testState.fixtures;
                parentFixtures = testState.parentFixtures;
                nock = testState.nock;
                idName = testState.idName;
                idParentName = testState.idParentName;
            });

            if (uncreatable) {
                it(`should not creates a ${namespace} by ${parentNamespace}`, async () => {
                    await expect(accessor.create(parentFixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should creates a ${namespace} by ${parentNamespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    const fixture = fixtures[0];
                    nock.initCombinedCreateRoutes(parentFixture, fixture);
                    expect(await accessor.create(fixture, parentFixture)).toEqual(fixture);
                });
            }

            if (unreadable) {
                it(`should not gets a ${namespace} by ${parentNamespace}`, async () => {
                    await expect(accessor.readOne(fixtures[0].id, parentFixtures[0])).rejects.toThrow();
                });

                it('should not find one by criteria', async () => {
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                        [idName]: 1,
                    };
                    await expect(accessor.findByCriteria(criteria, parentFixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should gets a ${namespace} by ${parentNamespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    const fixture = fixtures[0];
                    nock.initCombinedReadRoutes(parentFixture, fixture);
                    expect(await accessor.readOne(fixture[idName], parentFixture)).toEqual(fixture);
                });

                it('should find one by criteria', async () => {
                    const parentFixture = parentFixtures[0];
                    const fixture = fixtures[0];
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                        [idName]: fixture[idName],
                    };
                    nock.initCombinedFindByCriteriaRoutes(parentFixture, fixture, { ...criteria });
                    expect(await accessor.findByCriteria(criteria, parentFixture)).toEqual(fixture);
                });
            }

            if (unreadAllable) {
                it(`should not gets all ${namespace}s by ${parentNamespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    await expect(accessor.read(parentFixture)).rejects.toThrow();
                });

                it('should not find all by criteria', async () => {
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                        [idName]: 1,
                    };
                    const parentFixture = parentFixtures[0];
                    await expect(accessor.findAllByCriteria(criteria, parentFixture)).rejects.toThrow();
                });

                it(`should not gets paginated ${namespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    await expect(accessor.readPaginated(1, 1, parentFixture, {}).next()).rejects.toThrow();
                });
            } else {
                it(`should gets all ${namespace}s by ${parentNamespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    nock.initCombinedReadAllRoutes(parentFixture, fixtures);
                    expect(await accessor.read(parentFixture)).toEqual(fixtures);
                });

                it('should find all by criteria', async () => {
                    const criteria = {
                        baz: ['foo', 'bar', true],
                        foo: 'bar',
                    };
                    const parentFixture = parentFixtures[0];
                    nock.initCombinedFindAllByCriteriaRoutes(parentFixture, fixtures, { ...criteria });
                    expect(await accessor.findAllByCriteria(criteria, parentFixture)).toEqual(fixtures);
                });

                it('should read with pagination of 1 item by page', async () => {
                    const parentFixture = parentFixtures[0];
                    nock.initCombinedReadPaginatedRoutes(parentFixture, fixtures);
                    let iteration = 0;
                    for await (const data of accessor.readPaginated(1, 1, {}, parentFixture)) {
                        expect(data).toEqual([fixtures[iteration]]);
                        iteration++;
                    }
                });
            }

            if (unupdatable) {
                it(`should not updates a ${namespace} by ${parentNamespace}`, async () => {
                    await expect(accessor.update(parentFixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should updates a ${namespace} by ${parentNamespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    const fixture = fixtures[0];
                    nock.initCombinedUpdateRoutes(parentFixture, fixture);
                    const updatedFixture = await accessor.update(fixture, parentFixture);
                    expect(updatedFixture).toEqual(fixture);
                });
            }

            if (undeletable) {
                it(`should not deletes a ${namespace} by ${parentNamespace}`, async () => {
                    await expect(accessor.delete(parentFixtures[0])).rejects.toThrow();
                });
            } else {
                it(`should deletes a ${namespace} by ${parentNamespace}`, async () => {
                    const parentFixture = parentFixtures[0];
                    const fixture = fixtures[0];
                    nock.initCombinedDeleteRoutes(parentFixture, fixture);
                    expect(await accessor.delete(fixture, parentFixture)).toBeTruthy();
                });
            }

            it(`should not manipulates a ${namespace} by nothing`, async () => {
                const wrongModel = { [idName]: FIXTURE_ERROR_ID };
                await Promise.all([
                    expect(accessor.readOne(FIXTURE_ERROR_ID)).rejects.toThrow(),
                    expect(accessor.read()).rejects.toThrow(),
                    expect(accessor.readPaginated().next()).rejects.toThrow(),
                    expect(accessor.create(wrongModel)).rejects.toThrow(),
                    expect(accessor.update(wrongModel)).rejects.toThrow(),
                    expect(accessor.delete(wrongModel)).rejects.toThrow(),
                    expect(accessor.findByCriteria({ ...wrongModel })).rejects.toThrow(),
                    expect(accessor.findAllByCriteria({})).rejects.toThrow(),
                ]);
            });

            if (!undeletable && !unupdatable && !uncreatable && !unreadable) {
                it(`should not manipulates an unknown ${namespace} by ${parentNamespace}`, async () => {
                    nock.initCombinedWrongRoutes(parentNamespace, namespace, 'get')
                        .initCombinedWrongRoutes(parentNamespace, namespace, 'put')
                        .initCombinedWrongRoutes(parentNamespace, namespace, 'delete');
                    const wrongModel = { [idName]: FIXTURE_ERROR_ID };
                    await Promise.all([
                        expect(accessor.readOne(FIXTURE_ERROR_ID, wrongModel)).rejects.toThrow(),
                        expect(accessor.update(wrongModel, wrongModel)).rejects.toThrow(),
                        expect(accessor.delete(wrongModel, wrongModel)).rejects.toThrow(),
                    ]);
                });
            }
        });
    });
}
