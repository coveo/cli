/* eslint-disable no-undef */
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

async function main() {
  const templates = getUiTemplates();
  const allNextVersions = await Promise.all(
    templates.map((p) => getPackageNextTestVersion(p))
  );

  const greatestVersion = getGreatestVersion(allNextVersions);
  console.log(greatestVersion);
}

main();
