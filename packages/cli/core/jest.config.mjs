import {defaults} from 'jest-config';
import {pathsToModuleNameMapper} from 'ts-jest';
import {compilerOptions} from './tsconfig.json';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.TS_NODE_PROJECT = join(__dirname, 'tsconfig.dev.json');

export default {
  rootDir: '.',
  extensionsToTreatAsEsm: [".ts"],
  preset: "ts-jest/presets/default-esm",
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
