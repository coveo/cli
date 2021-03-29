/* eslint-disable no-undef */
const {createWriteStream} = require('fs');
const {spawn} = require('child_process');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const {inc, valid, gte} = require('semver');
const {
  getUiTemplates,
  getPackageLastTestVersion,
} = require('./ui-template-utils');

async function getPackageNextTestVersion(packageName) {
  const lastVersion = await getPackageLastTestVersion(packageName);
  return inc(lastVersion, 'patch');
}

function getGreatestVersion(versions = []) {
  const validVersions = versions.filter((v) => valid(v));
  const reducer = (previousVersion, currentVersion) =>
    gte(currentVersion, previousVersion) ? currentVersion : previousVersion;
  return validVersions.reduce(reducer);
}

async function getNextTestVersion() {
  const templates = getUiTemplates();
  const allNextVersions = await Promise.all(
    templates.map((p) => getPackageNextTestVersion(p))
  );

  const greatestVersion = getGreatestVersion(allNextVersions);
  return greatestVersion;
}

function saveValueInEnvVariable(variable, value, output) {
  return new Promise((resolve) => {
    const logStream = createWriteStream(output, {flags: 'a'});
    const saveProcess = spawn('echo', [`${variable}=${value}`]);

    saveProcess.stdout.pipe(logStream);

    saveProcess.on('error', (error) => {
      console.error(error);
    });
    saveProcess.on('close', () => {
      resolve();
    });
  });
}

async function main() {
  const argv = yargs(hideBin(process.argv)).argv;
  if (Boolean(argv.variable) === false) {
    console.error(
      'The --variable flag is missing. Specify an environment variable to store the next test version.'
    );
    return;
  }
  if (Boolean(argv.output) === false) {
    console.error(
      'The --output flag is missing. Specify the output to redirect the environment variable assignment.'
    );
    return;
  }
  const nextTestVersion = await getNextTestVersion();
  await saveValueInEnvVariable(argv.variable, nextTestVersion, argv.output);
}

main();
