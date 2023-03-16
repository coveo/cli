export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  clearMocks: true,
  silent: true,
  testTimeout: 60e3,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
