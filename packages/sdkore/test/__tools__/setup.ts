import path from 'path';
import { FixturesLoader } from 'sdkore-test-maker';

export const Setup = {
    fixtures: async () => {
        return FixturesLoader.getInstance(path.resolve(__dirname, '../__fixtures__/')).save();
    },
};
