const {defaults} = require('jest-config');
const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./tsconfig.json');

module.exports = {
  rootDir: '.',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.dev.json',
    },
  },
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
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};
