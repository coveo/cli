const {backOff} = require('exponential-backoff');
const {spawnSync} = require('child_process');

/**
 * All the UI templates used by 3rd-party CLIs.
 *
 * The following packages will be published before every E2E test
 * with a version matching this format: 0.0.x
 */
const packagesToWait = [
  // TODO: uncomment
  // '@coveo/cra-template',
  // '@coveo/vue-cli-plugin-typescript',
  // '@coveo/angular',
  '@coveo/create-atomic',
  '@coveo/search-token-lambda',
  // '@coveo/search-token-server',
];

function getPackageLatestVersion(packageName) {
  const ciTestVersion = spawnSync('npm', ['show', packageName, 'version']);
  return ciTestVersion.stdout;
}

async function isLastTestVersionAvailable(packageName, lastVersion) {
  const response = getPackageLatestVersion(packageName);
  return response === lastVersion;
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
  return await Promise.all(
    packagesToWait.map((pkg) =>
      waitForPackage(pkg, process.env.UI_TEMPLATE_VERSION)
    )
  );
}

main();
