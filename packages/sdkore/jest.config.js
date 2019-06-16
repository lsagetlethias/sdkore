//@ts-check
// const { pathsToModuleNameMapper } = require('ts-jest');
// const { compilerOptions } = require('./test/tsconfig.json');

// console.warn(pathsToModuleNameMapper(compilerOptions.paths));

/** @type Partial<jest.DefaultOptions> & { [K: string]: any } */
const config = {
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/test/tsconfig.json'
        },
    },
    preset: 'ts-jest',
    globalSetup: '<rootDir>/test/__tools__/globalSetup.js',
    globalTeardown: '<rootDir>/test/__tools__/globalTeardown.js',
    setupFilesAfterEnv: ['<rootDir>/test/__tools__/beforeAll.ts'],
    transform: {
        '.ts': 'ts-jest',
    },
    // collectCoverageFrom: ['src/**/!(*.d|I[A-Z]*).{ts,tsx}'],
    collectCoverageFrom: ['src/**/!(*.d|I[A-Z]*|DTO/model/*).{ts,tsx}'],
    coverageReporters: ['json-summary', 'lcov', 'text-summary'],
    // coveragePathIgnorePatterns: [
    //     'I[A-Z].*\.{ts}'
    // ],
    testPathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/test/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json']
};

module.exports = config;
