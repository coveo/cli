/* eslint-disable no-undef */

const {spawn} = require('child_process');
const {valid} = require('semver');

/**
 * All the UI templates used by 3rd-party CLIs.
 *
 * The following packages will be published before every E2E test
 * with a version matching this format: 0.0.x
 */
const getUiTemplates = () => [
  '@coveo/cra-template',
  '@coveo/vue-cli-plugin-typescript',
  // '@coveo/angular',
];

function cleanTestVersion(dirtyVersion) {
  const versionRegex = /([0]+)\.([0]+)\.([0-9]+)/;
  const match = dirtyVersion.match(versionRegex);
  return match && match[0];
}

function getLastValidVersion(allVersions = []) {
  let lastVersion = allVersions.pop();

  while (allVersions.length > 0 && Boolean(valid(lastVersion)) == false) {
    lastVersion = cleanTestVersion(allVersions.pop());
  }
  return lastVersion;
}

function getPackageLastTestVersion(packageName) {
  let lastVersion = '';
  const spawnProcess = spawn('npm', [
    'show',
    `${packageName}@0.0.*`,
    'version',
    '--json',
  ]);

  spawnProcess.stdout.on('data', (data) => {
    const allVersions = data.toString().split('\n');
    lastVersion = getLastValidVersion(allVersions);
  });

  return new Promise((resolve) => {
    spawnProcess.stdout.on('close', () => resolve(lastVersion));
  });
}

module.exports = {
  getPackageLastTestVersion,
  getUiTemplates,
};
