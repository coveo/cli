const {createLintConfig} = require('../../eslint.compat.cjs');

module.exports = createLintConfig({
  ignores: ['deploy-project'],
  tsconfigRootDir: __dirname,
});
