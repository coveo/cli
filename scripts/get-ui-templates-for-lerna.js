const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const {getUiTemplates} = require('./ui-template-utils');

const getUiTemplatesForLerna = () => {
  const argv = yargs(hideBin(process.argv)).argv;
  return getUiTemplates()
    .map((t) => (argv.prefix ? `${argv.prefix} ${t}` : t))
    .join(argv.separator || ' ');
};

console.log(getUiTemplatesForLerna());
