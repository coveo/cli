const {defaults} = require('jest-config');
const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./tsconfig.json');

process.env.TS_NODE_PROJECT = require.resolve('./tsconfig.dev.json');

module.exports = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    '/__test__/',
    '/__stub__/',
  ],
  clearMocks: true,
  testTimeout: 60e3,
  testMatch: ['**/?(*.)+(spec|test).?(it.)[jt]s?(x)'],
  moduleNameMapper: {
    '^get-port$': '<rootDir>/src/__test__/getPortMock.ts',
    '^inquirer$': '<rootDir>/src/__test__/inquirerMock.ts',
    '^open$': '<rootDir>/src/__test__/openMock.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
};
