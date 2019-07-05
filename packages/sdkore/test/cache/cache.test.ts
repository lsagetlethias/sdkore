import indexedDB from 'fake-indexeddb';
import { ArrayCache, ChainCache, ICache, IndexedDBCache, NullCache, StorageCache, Typeof } from '../../src';
import { Storage, StorageMock } from '../__utils__/mocks/StorageMock';

describe('Cache', () => {
    const KEY = 'MOCK_KEY';
    const VALUE = 'MOCK_VALUE';
    const _now = Date.now;

    const list: Array<[Typeof<ICache>, any[]]> = [
        [ArrayCache, []],
        [StorageCache, ['', false]],
        [StorageCache, ['', true]],
        [ChainCache, []],
        [IndexedDBCache, []],
    ];
    list.forEach(cacheClassArg => {
        const cacheClass = cacheClassArg[0];
        const cacheArgs = cacheClassArg[1];
        const exposingDesc: PropertyDescriptor = {
            configurable: true,
            enumerable: true,
            writable: true,
        };

        describe(`${cacheClass.name}${cacheClassArg.length ? ` with ${JSON.stringify(cacheArgs)}` : ''}`, () => {
            let cache: ICache;

            beforeEach(() => {
                Date.now = jest.fn(() => 0);
                cache =
                    cacheClass === ChainCache
                        ? new ChainCache([new ArrayCache(), new ArrayCache()])
                        : new cacheClass(...cacheArgs);
            });

            afterEach(async () => {
                Date.now = _now;
                Object.defineProperty(window, 'sessionStorage', {
                    value: new StorageMock(),
                    ...exposingDesc,
                });
                Object.defineProperty(window, 'localStorage', {
                    value: new StorageMock(),
                    ...exposingDesc,
                });
                Object.defineProperty(window, 'Storage', {
                    value: Storage,
                    ...exposingDesc,
                });
                Object.defineProperty(window, 'indexedDB', {
                    value: indexedDB,
                    ...exposingDesc,
                });

                await cache['reset']();
            });

            it('should set and get a value', async () => {
                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                expect(await cache.get(KEY)).toBe(VALUE);
            });

            it('should set and get values', async () => {
                const expectedNull = {};
                expectedNull[KEY] = null;
                expect(await cache.getMultiple([KEY])).toEqual(expectedNull);

                const expected = {};
                expected[KEY] = VALUE;
                expect(await cache.getMultiple([KEY], VALUE)).toEqual(expected);

                expect(await cache.setMultiple(expected)).toBeTruthy();
                expect(await cache.getMultiple([KEY], VALUE)).toEqual(expected);

                expect(await cache.getMultiple(['random'], '42')).toEqual({ random: '42' });
            });

            it('should not get a value with outdated lifetime', async () => {
                expect(await cache.set(KEY, VALUE, 1)).toBeTruthy();
                Date.now = jest.fn(() => 10000);
                expect(await cache.has(KEY)).toBeFalsy();
            });

            it('should get defaultValue instead of value with outdated lifetime', async () => {
                expect(await cache.set(KEY, VALUE, 1)).toBeTruthy();
                Date.now = jest.fn(() => 10000);
                expect(await cache.get(KEY, 42)).toEqual(42);
            });

            it('should not get a non set value', async () => {
                expect(await cache.get(VALUE)).toBeNull();
            });

            it('should find a value', async () => {
                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                expect(await cache.has(KEY)).toBeTruthy();
            });

            it('should delete a value', async () => {
                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                expect(await cache.delete(KEY)).toBeTruthy();
                expect(await cache.has(KEY)).toBeFalsy();

                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                expect(await cache.deleteMultiple([KEY])).toBeTruthy();
                expect(await cache.has(KEY)).toBeFalsy();
            });

            it('should delete a value through set', async () => {
                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                expect(await cache.has(KEY)).toBeTruthy();

                expect(await cache.set(KEY, VALUE, 0)).toBeTruthy();
                expect(await cache.has(KEY)).toBeFalsy();
            });

            it('should clear all values', async () => {
                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                expect(await cache.clear()).toBeTruthy();
                expect(await cache.has(KEY)).toBeFalsy();
            });

            it('should reset', async () => {
                expect(await cache.set(KEY, VALUE)).toBeTruthy();
                await cache['reset']();
                expect(await cache.has(KEY)).toBeFalsy();
            });

            it('should prune outdated values', async () => {
                expect(await cache.set(KEY, VALUE, 1)).toBeTruthy();
                expect(await cache.set(`${KEY}_1`, VALUE)).toBeTruthy();
                Date.now = jest.fn(() => 10000);
                expect(await cache['prune']()).toBeTruthy();
                expect(await cache.has(KEY)).toBeFalsy();
                expect(await cache.has(`${KEY}_1`)).toBeTruthy();
            });

            if (cacheClass === StorageCache) {
                it('should not instanciate properly if session/local storage is not available', () => {
                    Reflect.deleteProperty(window, 'sessionStorage');
                    Reflect.deleteProperty(window, 'localStorage');
                    expect(() => {
                        cache = new cacheClass(...cacheArgs);
                    }).toThrow();
                });

                it('should not instanciate properly if Storage is not available', () => {
                    Reflect.deleteProperty(window, 'Storage');
                    expect(() => {
                        cache = new cacheClass(...cacheArgs);
                    }).toThrow();
                });

                it('should throw if storage is broken (old browsers)', () => {
                    const brokenStorage = {
                        getItem() {
                            throw new Error();
                        },
                    };
                    Object.defineProperty(window, 'sessionStorage', {
                        value: brokenStorage,
                        ...exposingDesc,
                    });
                    Object.defineProperty(window, 'localStorage', {
                        value: brokenStorage,
                        ...exposingDesc,
                    });
                    expect(() => {
                        cache = new cacheClass(...cacheArgs);
                    }).toThrow();
                });
            } else if (cacheClass === ChainCache) {
                it('should not instanciate', () => {
                    expect(() => {
                        cache = new ChainCache([]);
                    }).toThrow();
                });

                it('should fill outdated caches', async () => {
                    const resetTableCache = new ArrayCache();
                    cache = new ChainCache([resetTableCache, new StorageCache('CHAIN-')], null);

                    await cache.set(KEY, VALUE);
                    await resetTableCache.reset();
                    expect(await resetTableCache.get(KEY)).toBeNull();

                    expect(await cache.get(KEY)).toEqual(VALUE);
                    expect(await resetTableCache.get(KEY)).toEqual(VALUE);

                    const expected = { random: '42' };
                    expected[KEY] = VALUE;
                    await cache.set(KEY, VALUE);
                    await resetTableCache.reset();
                    expect(await cache.getMultiple([KEY, 'random'], '42')).toEqual(expected);
                });
            }
        });
    });

    describe('NullCache', () => {
        let cache: NullCache;

        beforeEach(() => {
            cache = new NullCache();
        });

        it('should get the defaultValue or null', async () => {
            expect(await cache.get(KEY)).toBeNull();
            expect(await cache.get(KEY, VALUE)).toBe(VALUE);

            const expectedNull = {};
            expectedNull[KEY] = null;
            expect(await cache.getMultiple([KEY])).toEqual(expectedNull);

            const expected = {};
            expected[KEY] = VALUE;
            expect(await cache.getMultiple([KEY], VALUE)).toEqual(expected);
        });

        it('should not set anything', async () => {
            expect(await cache.set(KEY, VALUE, 1)).toBeFalsy();

            const values = {};
            values[KEY] = VALUE;
            expect(await cache.setMultiple(values, 1)).toBeFalsy();
        });

        it('should always delete anything', async () => {
            expect(await cache.delete(KEY)).toBeTruthy();
            expect(await cache.deleteMultiple([KEY])).toBeTruthy();
        });

        it('should always clear', async () => {
            expect(await cache.clear()).toBeTruthy();
        });

        it('should not find anything', async () => {
            expect(await cache.has(KEY)).toBeFalsy();
        });
    });
});
