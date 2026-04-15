const base = require('@coveo/cli-commons-dev/.eslintrc');

const config = {
  ...base,
  ignorePatterns: ['dist', 'coverage', 'tmp', 'lib'],
};

config.parserOptions = {...config.parserOptions, project: 'tsconfig.json'};

module.exports = config;
