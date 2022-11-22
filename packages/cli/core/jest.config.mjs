import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {pathsToModuleNameMapper} from 'ts-jest';
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import tsconfig from './tsconfig.json' assert {type: 'json'};

process.env.TS_NODE_PROJECT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  './tsconfig.dev.json'
);
/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  roots: ['<rootDir>'],
  modulePaths: ['.'], // <-- This will be set to 'baseUrl' value
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    useESM: true,
    rootDir: '<rootDir>/src',
  }),
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/**/*.{ts,tsx}'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
