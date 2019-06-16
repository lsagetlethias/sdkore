require('ts-node').register({
    project: require('path').resolve(__dirname, '../tsconfig.json'),
});
const { Teardown } = require('./teardown');

module.exports = async function() {
    await Teardown.fixtures();
};
