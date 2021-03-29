/* eslint-disable no-undef */
const {spawnSync} = require('child_process');
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

function saveValueInEnvVariable(variable, value) {
  if (Boolean(variable) === false) {
    console.error(
      'Please specify an environment variable to store the next test version'
    );
    return;
  }
  spawnSync('echo', [`"${variable}=${value}"`, '>>', '$GITHUB_ENV'], {
    stdio: 'inherit',
  });
}

async function main() {
  const argv = yargs(hideBin(process.argv)).argv;
  const nextTestVersion = await getNextTestVersion();
  saveValueInEnvVariable(argv.variable, nextTestVersion);
}

main();
