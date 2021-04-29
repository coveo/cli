const {spawnSync} = require('child_process');

/**
 * All the UI templates used by 3rd-party CLIs.
 *
 * The following packages will be published before every E2E test
 * with a version matching this format: 0.0.x
 */
const getUiTemplates = () => [
  '@coveo/cra-template@ci-test',
  '@coveo/vue-cli-plugin-typescript@ci-test',
  '@coveo/angular@ci-test',
  '@coveo/angular@latest',
];

function getCiTestPackageVersion(packageName) {
  const ciTestVersion = spawnSync('npm', ['show', packageName, 'version']);
  return ciTestVersion.stdout;
}

module.exports = {
  getPackageLastTestVersion: getCiTestPackageVersion,
  getUiTemplates,
};
