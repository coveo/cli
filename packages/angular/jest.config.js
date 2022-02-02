const {defaults} = require('jest-config');

module.exports = {
  rootDir: 'src/',
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    '/__test__/',
    '/__stub__/',
  ],
  clearMocks: true,
  testTimeout: 60e3,
  testMatch: ['**/?(*.)+(spec|test).?(it.)[jt]s?(x)'],
};
