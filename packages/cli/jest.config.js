const {defaults} = require('jest-config');

module.exports = {
  rootDir: 'src/',
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  globalSetup: './__test__/setup.ts',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    '/__test__/',
    '/__stub__/',
  ],
  clearMocks: true,
  testTimeout: 60e3,
  testMatch: ['**/?(*.)+(spec|test).?(it.)[jt]s?(x)'],
};
