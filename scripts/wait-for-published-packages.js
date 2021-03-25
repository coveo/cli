/* eslint-disable no-undef */
const waitOn = require('wait-on');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const {getUiTemplates} = require('./get-ui-templates');

async function waitForPackage(packageName, version) {
  const opts = {
    resources: [`https://www.npmjs.com/package/${packageName}/v/${version}`],
    delay: 1e3, // initial delay in ms
    interval: 5e3, // poll interval in ms
    timeout: 5 * 60 * 1e3, // timeout in ms
    window: 1e3, // stabilization time in ms
    log: true,
  };

  try {
    await waitOn(opts);
  } catch (err) {
    console.error(`Package ${packageName}@${version} does not exist`);
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv)).argv;
  const templates = getUiTemplates();
  if (Boolean(argv.v) === false) {
    console.log('Missing -v flag');
    return;
  }

  return await Promise.all(templates.map((t) => waitForPackage(t, argv.v)));
}

main();
