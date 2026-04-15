const {createLintConfig} = require('../../../eslint.compat.cjs');

module.exports = createLintConfig({
  ignores: ['dist', 'coverage'],
  tsconfigRootDir: __dirname,
});
