import nock from 'nock';
import { stringify as queryString } from 'query-string';
import { Typeof } from 'sdkore';
import { FIXTURE_ERROR_ID, MOCK_URL, RESPONSE_HEADERS } from './Const';
import { FixtureNamespace } from './FixtureNamespace';
import { Fixture } from './FixturesLoader';

export interface RouteList {
    [P: string]: string;
}

export interface EnsureConfig {
    headers?: { [h: string]: string };
}

class NockMockClass {
    private _scope: nock.Scope;
    private get scope(): nock.Scope {
        nock.disableNetConnect();
        return this._scope || (this._scope = nock(MOCK_URL));
    }

    public init<T extends NockRoutes>(
        routeList: RouteList,
        nockRoutesClass: Typeof<T> = NockRoutes as any,
    ): NockRoutes {
        return new nockRoutesClass(this.scope, routeList);
    }

    public clean() {
        (this.scope['interceptors'] as nock.Interceptor[]).forEach(i => {
            nock.removeInterceptor(i);
        });
        nock.cleanAll();
    }

    public kill() {
        nock.restore();
        nock.cleanAll();
        nock.enableNetConnect();
    }
}
export const NockMock = new NockMockClass();

export class NockRoutes {
    constructor(public scope: nock.Scope, protected readonly routes: RouteList) {}

    private paginationHeaderAndData(
        uri: string,
        regexpRoute: RegExp,
        fixtures: Fixture[],
    ): [number, Fixture[], object] {
        const match = uri.match(regexpRoute);
        const currentPageAsked = Number(match[1]);
        const paginationMax = Number(match[2]);

        const startIdx = (currentPageAsked - 1) * paginationMax + 1;
        const endIdx = Math.min(currentPageAsked * paginationMax, fixtures.length);

        return [
            200,
            fixtures.slice((currentPageAsked - 1) * paginationMax, currentPageAsked * paginationMax),
            {
                [RESPONSE_HEADERS.CONTENT_RANGE]: `${startIdx}-${endIdx}/${fixtures.length}`,
            },
        ];
    }

    public detachedScope(options?: nock.Options) {
        return options ? nock(MOCK_URL, options) : this.scope;
    }

    public ensure(config: EnsureConfig): this {
        Object.entries(config.headers).forEach(([name, value]) => (this.scope = this.scope.matchHeader(name, value)));
        return this;
    }

    public restore() {
        nock.restore();
    }

    public activate() {
        nock.activate();
    }

    public initReadRoutes(fixture: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const idName = fixture['@idName'];
        if (fixture[idName] !== void 0) {
            this.scope.get(`${route}/${fixture[idName]}`).reply(200, fixture);
        }

        return this;
    }

    public initCombinedReadRoutes(fixture: Fixture, fixturePlus: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const routePlus = this.routes[fixturePlus['@namespace']];
        const idName = fixture['@idName'];
        const idPlusName = fixturePlus['@idName'];
        if (fixture[idName] !== void 0 && fixturePlus[idPlusName] !== void 0) {
            this.scope
                .get(`${route}/${fixture[idName]}${routePlus}/${fixturePlus[idPlusName]}`)
                .reply(200, fixturePlus);
        }

        return this;
    }

    public initReadAllRoutes(fixtures: Fixture[]): this {
        const route = this.routes[fixtures[0]['@namespace']];
        this.scope.get(route).reply(200, fixtures, {
            [RESPONSE_HEADERS.CONTENT_RANGE]: `1-${fixtures.length}/${fixtures.length}`,
        });

        return this;
    }

    public initCombinedReadAllRoutes(fixture: Fixture, fixturesPlus: Fixture[]): this {
        const route = this.routes[fixture['@namespace']];
        const routePlus = this.routes[fixturesPlus[0]['@namespace']];
        const idName = fixture['@idName'];
        if (fixture[idName] !== void 0) {
            this.scope.get(`${route}/${fixture[idName]}${routePlus}`).reply(200, fixturesPlus);
        }

        return this;
    }

    public initCreateRoutes(namespace: FixtureNamespace): this {
        const route = this.routes[namespace];
        this.scope.post(route).reply((uri, requestBody) => [201, JSON.parse(requestBody)]);

        return this;
    }

    public initCombinedCreateRoutes(fixture: Fixture, fixturePlus: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const routePlus = this.routes[fixturePlus['@namespace']];
        const idName = fixture['@idName'];
        if (fixture[idName] !== void 0) {
            this.scope
                .post(`${route}/${fixture[idName]}${routePlus}`)
                .reply((uri, requestBody) => [201, JSON.parse(requestBody)]);
        }

        return this;
    }

    public initUpdateRoutes(fixture: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const idName = fixture['@idName'];
        // this.doUploadRoute();
        if (fixture[idName] !== void 0) {
            this.scope.put(`${route}/${fixture[idName]}`).reply((uri, requestBody) => {
                return [
                    200,
                    {
                        ...fixture,
                        ...JSON.parse(requestBody),
                    },
                ];
            });
        }

        return this;
    }

    public initCombinedUpdateRoutes(fixture: Fixture, fixturePlus: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const routePlus = this.routes[fixturePlus['@namespace']];
        const idName = fixture['@idName'];
        const idPlusName = fixturePlus['@idName'];
        if (fixture[idName] !== void 0 && fixturePlus[idPlusName] !== void 0) {
            this.scope
                .put(`${route}/${fixture[idName]}${routePlus}/${fixturePlus[idPlusName]}`)
                .reply((uri, requestBody) => {
                    return [
                        200,
                        {
                            ...fixturePlus,
                            ...JSON.parse(requestBody),
                        },
                    ];
                });
        }

        return this;
    }

    public initDeleteRoutes(fixture: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const idName = fixture['@idName'];
        if (fixture[idName] !== void 0) {
            const url = `${route}/${fixture[idName]}`;
            this.scope.delete(url).reply(204);
        }

        return this;
    }

    public initCombinedDeleteRoutes(fixture: Fixture, fixturePlus: Fixture): this {
        const route = this.routes[fixture['@namespace']];
        const routePlus = this.routes[fixturePlus['@namespace']];
        const idName = fixture['@idName'];
        const idPlusName = fixturePlus['@idName'];
        if (fixture[idName] !== void 0 && fixturePlus[idPlusName] !== void 0) {
            this.scope.delete(`${route}/${fixture[idName]}${routePlus}/${fixturePlus[idPlusName]}`).reply(204);
        }

        return this;
    }

    public initWrongRoutes(namespace: FixtureNamespace, type: 'get' | 'put' | 'delete'): this {
        const errorRet = {
            description: 'User not found',
            message: 'Ressource introuvable',
        };
        const route = this.routes[namespace] || '';
        this.scope[type](`${route}/${FIXTURE_ERROR_ID}`).reply(404, errorRet);
        // no error route handling for create/POST or GETall

        return this;
    }

    public initCombinedWrongRoutes(
        namespace: FixtureNamespace,
        namespacePlus: FixtureNamespace,
        type: 'get' | 'put' | 'delete',
    ): this {
        const errorRet = {
            description: 'User not found',
            message: 'Ressource introuvable',
        };
        const route = this.routes[namespace];
        const routePlus = this.routes[namespacePlus];
        this.scope[type](`${route}/${FIXTURE_ERROR_ID}${routePlus}/${FIXTURE_ERROR_ID}`).reply(404, errorRet);
        // no error route handling for create/POST or GETall

        return this;
    }

    public initFindByCriteriaRoutes(fixture: Fixture, criteria: any): this {
        const route = this.routes[fixture['@namespace']];
        const idName = fixture['@idName'];
        const crit = { ...criteria };
        delete crit[idName];
        if (fixture[idName] !== void 0) {
            this.scope
                .get(
                    `${route}/${fixture[idName]}?${queryString(crit, {
                        arrayFormat: 'bracket',
                    })}`,
                )
                .reply(200, fixture);
        }

        return this;
    }

    public initCombinedFindByCriteriaRoutes(parentFixture: Fixture, fixture: Fixture, criteria: any): this {
        const parentRoute = this.routes[parentFixture['@namespace']];
        const route = this.routes[fixture['@namespace']];
        const idParentName = parentFixture['@idName'];
        const idName = fixture['@idName'];
        const crit = { ...criteria };
        delete crit[idName];
        if (fixture[idName] !== void 0 && parentFixture[idParentName] !== void 0) {
            this.scope
                .get(
                    `${parentRoute}/${parentFixture[idParentName]}${route}/${fixture[idName]}?${queryString(crit, {
                        arrayFormat: 'bracket',
                    })}`,
                )
                .reply(200, fixture);
        }

        return this;
    }

    public initFindAllByCriteriaRoutes(fixtures: Fixture[], criteria: any): this {
        const route = this.routes[fixtures[0]['@namespace']];
        this.scope.get(`${route}?${queryString(criteria, { arrayFormat: 'bracket' })}`).reply(200, fixtures);

        return this;
    }

    public initCombinedFindAllByCriteriaRoutes(parentFixture: Fixture, fixtures: Fixture[], criteria: any): this {
        const parentRoute = this.routes[parentFixture['@namespace']];
        const route = this.routes[fixtures[0]['@namespace']];
        const idParentName = parentFixture['@idName'];
        if (parentFixture[idParentName] !== void 0) {
            this.scope
                .get(
                    `${parentRoute}/${parentFixture[idParentName]}${route}?${queryString(criteria, {
                        arrayFormat: 'bracket',
                    })}`,
                )
                .reply(200, fixtures);
        }

        return this;
    }

    public initReadPaginatedRoutes(fixtures: Fixture[]): this {
        const route = this.routes[fixtures[0]['@namespace']];
        const regexpRoute = new RegExp(`${route}\\?range=([0-9]+)-([0-9]+)`, 'i');
        this.scope
            .get(regexpRoute)
            .times(fixtures.length)
            .reply(uri => this.paginationHeaderAndData(uri, regexpRoute, fixtures));

        return this;
    }

    public initCombinedReadPaginatedRoutes(parentFixture: Fixture, fixtures: Fixture[]): this {
        const parentRoute = this.routes[parentFixture['@namespace']];
        const route = this.routes[fixtures[0]['@namespace']];
        const idParentName = parentFixture['@idName'];
        if (parentFixture[idParentName] !== void 0) {
            const regexpRoute = new RegExp(
                `${parentRoute}/${parentFixture[idParentName]}${route}\\?range=([0-9]+)-([0-9]+)`,
                'i',
            );
            this.scope
                .get(regexpRoute)
                .times(fixtures.length)
                .reply(uri => this.paginationHeaderAndData(uri, regexpRoute, fixtures));
        }

        return this;
    }
}
