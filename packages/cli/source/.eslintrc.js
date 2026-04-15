const base = require('@coveo/cli-commons-dev/.eslintrc');

const config = {
  ...base,
  ignorePatterns: ['lib', 'coverage', 'the_config_dir'],
};
config.parserOptions = {...config.parserOptions, project: 'tsconfig.json'};

module.exports = config;
