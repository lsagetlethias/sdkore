// tslint:disable:no-console
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

export interface Fixture {
    '@namespace': string;
    '@idName': string;

    [key: string]: any;
}

interface Fixtures {
    [name: string]: Fixture;
}

export class FixturesLoader {
    private static INSTANCE: FixturesLoader = null;
    private FIXTURES: Fixtures;
    private hydrated = false;
    private readonly compiledFixturesPath: string;

    protected constructor(private readonly fixturesFolder: string) {
        this.compiledFixturesPath = path.resolve(fixturesFolder, '_compiled.json');
    }

    public static getInstance(fixturesFolder?: string): FixturesLoader {
        if (null === FixturesLoader.INSTANCE) {
            if (!fixturesFolder) {
                throw new Error('No fixtures folder provided for sdkore-test-maker.');
            }
            FixturesLoader.INSTANCE = new FixturesLoader(fixturesFolder);
        }
        return FixturesLoader.INSTANCE;
    }

    private async prepare() {
        const rawFixtures = {};
        const fixturePaths: string[] = (await readdir(this.fixturesFolder)).filter(
            p => !p.startsWith('_') && p.substr(-5) === '.json',
        );

        const fixtureContents = await Promise.all(
            fixturePaths.map(f => {
                return readFile(path.resolve(this.fixturesFolder, f), 'utf-8').then(content => {
                    return {
                        content,
                        namespace: f.replace('.json', ''),
                    };
                });
            }),
        );
        fixtureContents.forEach(f => {
            const nsAddedFixtures = {};
            Object.entries(JSON.parse(f.content)).forEach(
                ([name, fixture]) =>
                    (nsAddedFixtures[name] = {
                        '@namespace': f.namespace,
                        ...fixture,
                    }),
            );
            rawFixtures[f.namespace] = nsAddedFixtures;
        });

        return rawFixtures;
    }

    private hydrate(rawFixtures: object) {
        let fixtureFlattenMap = {};
        Object.entries(rawFixtures).forEach(
            ([namespace, fixture]) =>
                (fixtureFlattenMap = {
                    ...fixtureFlattenMap,
                    ...fixture,
                }),
        );

        const doer = (f: object, root = false) => {
            const entries = Object.entries(f);
            const ret = {};
            const resolved = {};

            entries.forEach(([key, value]) => {
                if (Object(value) === value) {
                    ret[key] = doer(value);
                } else if ('string' === typeof value && value.startsWith('@')) {
                    const token = value.substr(1);
                    if (token.startsWith('@')) {
                        ret[key] = token;
                    } else {
                        if (resolved[token]) {
                            ret[key] = resolved[token];
                        } else {
                            if (!fixtureFlattenMap[token]) {
                                throw new Error(`Fixture ${token} is missing for ${f['@namespace']}.json`);
                            } else if (fixtureFlattenMap[token] === f) {
                                throw new Error(`Fixture ${token} is calling itself.`);
                            }
                            const namespacedFixture = doer(fixtureFlattenMap[token], true);
                            delete namespacedFixture['@namespace'];
                            ret[key] = namespacedFixture;
                        }
                    }
                } else {
                    ret[key] = value;
                }

                if (root) {
                    resolved[key] = ret;
                }
            });

            return ret;
        };

        this.FIXTURES = doer(fixtureFlattenMap, true);
    }

    public async save() {
        if (!this.hydrated) {
            this.hydrate(await this.prepare());
        }

        fs.writeFileSync(this.compiledFixturesPath, JSON.stringify(this.FIXTURES));
        console.info(`Fixtures compiled to ${this.compiledFixturesPath} file.`);
    }

    public async clear() {
        console.info(`Clearing compiled fixtures from ${this.compiledFixturesPath} file.`);
        return promisify(rimraf)(this.compiledFixturesPath);
    }

    /**
     * Load fixtures.
     *
     * @param namespace Filter by namespace
     * @param compiled Get from compiled fixtures
     * @param ns Keep `@namespace` property
     */
    public async load(namespace?: string, compiled = false, ns = false): Promise<Fixture[]> {
        if (compiled && !this.FIXTURES) {
            try {
                this.FIXTURES = JSON.parse(await readFile(this.compiledFixturesPath, 'utf-8'));
                this.hydrated = true;
            } catch {
                console.warn(`Compiled fixtures can't be load. Please check the file ${this.compiledFixturesPath}.`);
            }
        }

        if (!this.hydrated) {
            this.hydrate(await this.prepare());
        }

        let F = Object.values(this.FIXTURES);
        const ret: Fixture[] = [];

        if (namespace) {
            F = F.filter(f => f['@namespace'] === namespace);
        }

        F.forEach(f => {
            if (!ns) {
                delete f['@namespace'];
            }
            ret.push(f);
        });
        return ret;
    }
}
