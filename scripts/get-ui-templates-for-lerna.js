const {getUiTemplates} = require('./ui-template-utils');

const getUiTemplatesForLerna = () =>
  getUiTemplates()
    .map((t) => `--scope ${t}`)
    .join(' ');

console.log(getUiTemplatesForLerna());
