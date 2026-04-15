const {createLintConfig} = require('./eslint.compat.cjs');

module.exports = createLintConfig({
  ignores: [
    'packages',
    'utils',
    '.coveo',
    '**/dist',
    '**/lib',
    'artifacts',
    'ui-projects',
    'verdaccio',
  ],
  tsconfigRootDir: __dirname,
});
