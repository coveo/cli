/* eslint-disable no-undef */
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const {getUiTemplates} = require('./ui-template-utils');
const {backOff} = require('exponential-backoff');
const {getPackageLastTestVersion} = require('./ui-template-utils');

async function isLastTestVersionAvailable(packageName, lastVersion) {
  const response = await getPackageLastTestVersion(packageName);
  return new Promise((resolve, reject) => {
    return response === lastVersion ? resolve() : reject();
  });
}

async function waitForPackage(packageName, version) {
  try {
    const pollInterval = 1e3;
    await backOff(() => isLastTestVersionAvailable(packageName, version), {
      delayFirstAttempt: true,
      startingDelay: pollInterval,
      maxDelay: pollInterval * 30,
    });
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
