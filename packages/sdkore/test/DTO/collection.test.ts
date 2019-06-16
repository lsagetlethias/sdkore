import * as fs from 'fs';
import * as path from 'path';
import { Collection, IModel } from '../../src/';

interface TestModel extends IModel {
    a: number;
    b: number;
    c: boolean;
    d: string;
}

describe('Collection', () => {
    let model: TestModel[];
    let collection: Collection<TestModel>;
    beforeEach(() => {
        model = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../collection.json'), 'utf-8'));
        collection = new Collection(model);
    });

    it('should sort the collection', () => {
        const data1 = collection.sortBy('id').data;
        expect(data1[0].id).toBe(39);
        expect(data1[1].id).toBe(59);

        const data2 = collection.sortBy('id', 'desc').data;
        expect(data2[0].id).toBe(969);
        expect(data2[1].id).toBe(958);

        expect(collection.sortBy('c').data[0].c).toBeFalsy();
        expect(collection.sortBy('c', 'desc').data[0].c).toBeTruthy();

        const data3 = collection.sortBy('d').data;
        expect(data3[0].d).toBe('0WdVR');
        expect(data3[1].d).toBe('3M6iI');

        const data4 = collection.sortBy('d', 'desc').data;
        expect(data4[0].d).toBe('zANYl');
        expect(data4[1].d).toBe('Yfzbr');
    });

    it('should filter the collection', () => {
        collection.filter(1);
        expect(collection.length).toBe(1);
        expect(collection.data).toEqual([{ a: 7, b: 962, c: false, d: 'EC613', id: 491 }]);

        collection.reset();
        collection.filter('a');
        expect(collection.data[0]).toEqual({ a: 493, b: 800, c: true, d: 'FAPD9', id: 526 });

        collection.reset();
        collection.filter(true);
        expect(collection.length).toBe(18);

        collection.reset();
        const baseLength = collection.length;
        collection.filter('BadFilterString');
        expect(collection.length).toBe(0);
        collection.reset();
        expect(collection.length).toBe(baseLength);

        expect(collection.reset().filter('7', 'd').length).toBeLessThan(collection.reset().filter(7).length);
    });
});
