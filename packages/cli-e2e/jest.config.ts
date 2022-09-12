/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  testEnvironment: 'node',
  globalSetup: process.env.CI ? './setup/ci.ts' : './setup/local.ts',
  globalTeardown: './teardown.ts',
  testMatch: process.env.CI
    ? ['**/__tests__/**/*specs?(.ci).ts']
    : ['**/__tests__/**/*specs.ts'],
};
