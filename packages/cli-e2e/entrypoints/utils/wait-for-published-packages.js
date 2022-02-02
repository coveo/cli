const {backOff} = require('exponential-backoff');
const {spawnSync} = require('child_process');

/**
 * All the UI templates used by 3rd-party CLIs.
 *
 * The following packages will be published before every E2E test
 * with a version matching this format: 0.0.x
 */
const packagesToWait = [
  '@coveo/cra-template',
  '@coveo/vue-cli-plugin-typescript',
  '@coveo/angular',
  '@coveo/create-atomic',
  '@coveo/search-token-lambda',
  '@coveo/search-token-server',
];

function showPackage(packageName) {
  spawnSync('npm', ['show', packageName]);
}

async function waitForPackage(packageName) {
  try {
    const pollInterval = 1e3;
    await backOff(() => showPackage(packageName), {
      delayFirstAttempt: true,
      startingDelay: pollInterval,
      maxDelay: pollInterval * 30,
    });
  } catch (err) {
    console.error(`Package ${packageName} does not exist`);
  }
}

async function main() {
  return await Promise.all(packagesToWait.map(waitForPackage));
}

main();
