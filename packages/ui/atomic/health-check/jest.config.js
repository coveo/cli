module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  clearMocks: true,
  silent: true,
  testTimeout: 60e3,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
