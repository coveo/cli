/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  testEnvironment: 'node',
  globalSetup: './setup.ts',
  globalTeardown: './teardown.ts',
  // TODO: CDX-160: Include spec files from ui projects once we have a mock of the headless engine
  testPathIgnorePatterns: ['/node_modules/', '/ui-projects/'],
};
