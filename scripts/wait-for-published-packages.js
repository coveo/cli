const {backOff} = require('exponential-backoff');
const {
  getPackageLastTestVersion,
  getUiTemplates,
} = require('./ui-template-utils');

async function isLastTestVersionAvailable(packageName, lastVersion) {
  const response = await getPackageLastTestVersion(packageName);
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
  const templates = getUiTemplates();
  return await Promise.all(
    templates.map((t) => waitForPackage(t, process.env.UI_TEMPLATE_VERSION))
  );
}

main();
