const base = require('@coveo/cli-commons-dev/.eslintrc');
const config = {...base};
config.parserOptions = {...config.parserOptions, project: 'tsconfig.json'};

module.exports = config;
