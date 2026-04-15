export default {
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151002],
        },
        tsconfig: './tsconfig.spec.json',
      },
    ],
  },
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
