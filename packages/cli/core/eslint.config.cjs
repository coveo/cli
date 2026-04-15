const {createLintConfig} = require('../../../eslint.compat.cjs');

module.exports = createLintConfig({
  ignores: ['dist', 'coverage', 'tmp', 'lib'],
  tsconfigRootDir: __dirname,
});
