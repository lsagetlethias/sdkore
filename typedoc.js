const { name } = require('./package.json');

module.exports = {
    out: 'doc/',
    name,
    readme: 'README.md',
    tsConfig: './tconfig.base.json',
    hideGenerator: true,
    exclude: 'index.ts',
    theme: 'minimal',
    ignoreCompilerErrors: true,
};
