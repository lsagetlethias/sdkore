import { FixturesLoader } from 'sdkore-test-maker';

export const Teardown = {
    fixtures: async () => {
        return FixturesLoader.getInstance().clear();
    },
};
