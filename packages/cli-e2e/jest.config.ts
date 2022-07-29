/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

const testOsFilter = process.platform === 'win32' ? 'windows' : 'linux';

export default {
  testEnvironment: 'node',
  globalSetup: process.env.CI ? './setup/ci.ts' : './setup/local.ts',
  globalTeardown: './teardown.ts',
  testMatch: process.env.CI
    ? [`**/__tests__/**/*specs?(.ci|.${testOsFilter}).ts`]
    : [`**/__tests__/**/*specs?(.${testOsFilter}).ts`],
};
