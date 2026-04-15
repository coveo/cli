const {createLintConfig} = require('../../../eslint.compat.cjs');

module.exports = createLintConfig({
  ignores: ['lib', 'coverage', 'the_config_dir'],
  tsconfigRootDir: __dirname,
});
