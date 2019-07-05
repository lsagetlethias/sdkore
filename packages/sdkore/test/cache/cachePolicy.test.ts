import { ArrayCache, DefaultCachePolicy } from '../../src';
import { MOCK_CACHE_TIME } from '../__utils__/Const';

describe('CachePolicy', () => {
    it('should set a cache once but throw the second time', () => {
        const cachePolicy = new DefaultCachePolicy();
        expect(cachePolicy.cache).toBeUndefined();
        expect(() => cachePolicy.setCache(new ArrayCache())).not.toThrow();
        expect(cachePolicy.cache).not.toBeUndefined();
        expect(() => cachePolicy.setCache(new ArrayCache())).toThrow();
    });

    it('should not override an existant cache', () => {
        const cachePolicy = new DefaultCachePolicy(new ArrayCache(), MOCK_CACHE_TIME, true);

        expect(() => cachePolicy.setCache(new ArrayCache())).toThrow();
    });
});
