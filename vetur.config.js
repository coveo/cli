/**
 * @file vetur.config.js
 * @see https://vuejs.github.io/vetur/guide/setup.html#advanced
 */

/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': true,
  },
  projects: [
    {
      root: './packages/vue-cli-plugin-typescript',
      package: './package.json',
      tsconfig: './tsconfig.json',
    },
  ],
};
