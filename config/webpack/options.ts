import path from 'path';

const ROOT_APP_PATH = path.resolve(__dirname, '../../');
const DEV_SERVER = process.env.WEBPACK_MODE === 'watch';

const alias = {
    '@app': `${ROOT_APP_PATH}/src`,
    '@config': `${ROOT_APP_PATH}/config`,
    '@examples': `${ROOT_APP_PATH}/examples`,
    '@npm': `${ROOT_APP_PATH}/node_modules`,
    '@output': `${ROOT_APP_PATH}/dist`,
    '@root': ROOT_APP_PATH,
    '@test': `${ROOT_APP_PATH}/test`,
};

import packageJson from '../../package.json';

export { DEV_SERVER, ROOT_APP_PATH, packageJson };
export const options = {
    alias,
};
