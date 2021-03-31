/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  testEnvironment: 'node',
  globalSetup: './setup.ts',
  globalTeardown: './teardown.ts',
  /**
   * TODO: CDX-160: Include spec files from ui projects once we have a mock of the headless engine
   * In th meantmime, do not execute tests outside the __tests__ folder.
   * More info -> https://jestjs.io/docs/configuration#testmatch-arraystring
   */
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
};
