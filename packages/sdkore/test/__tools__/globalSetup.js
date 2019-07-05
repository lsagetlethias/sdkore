require('ts-node').register({
    project: require('path').resolve(__dirname, '../tsconfig.json'),
});
const { Setup } = require('./setup');

module.exports = async function() {
    console.log('\n');
    await Setup.fixtures();
};
