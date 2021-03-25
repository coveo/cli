const {getUiTemplates} = require('./get-ui-templates');

const getUiTemplatesForLerna = () =>
  getUiTemplates()
    .map((t) => `--scope ${t}`)
    .join(' ');

console.log(getUiTemplatesForLerna());
