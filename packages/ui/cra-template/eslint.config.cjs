const {createLintConfig} = require('../../../eslint.compat.cjs');

module.exports = createLintConfig({
  tsconfigRootDir: __dirname,
});
