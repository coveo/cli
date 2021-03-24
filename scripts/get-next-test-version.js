#!/usr/bin/env node
/* eslint-disable no-undef */

const {spawn} = require('child_process');
const {inc, valid, gte} = require('semver');
const {readArguments} = require('./read-argument');

function cleanVersion(dirtyVersion) {
  const versionRegex = /([0]+)\.([0]+)\.([0-9]+)/;
  const match = dirtyVersion.match(versionRegex);
  return match && match[0];
}

function getLastVersion(allVersions = []) {
  let lastVersion = allVersions.pop();

  while (allVersions.length > 0 && Boolean(valid(lastVersion)) == false) {
    lastVersion = cleanVersion(allVersions.pop());
  }
  return lastVersion;
}

function getNextPatchVersion(packageName) {
  let nextVersion = '';
  const spawnProcess = spawn('npm', [
    'show',
    `${packageName}@0.0.*`,
    'version',
    '--json',
  ]);

  spawnProcess.stdout.on('data', (data) => {
    const allVersions = data.toString().split('\n');
    const lastVersion = getLastVersion(allVersions);
    nextVersion = inc(lastVersion, 'patch');
  });

  return new Promise((resolve) => {
    spawnProcess.stdout.on('close', () => resolve(nextVersion));
  });
}

function getGreatestVersion(versions = []) {
  const validVersions = versions.filter((v) => valid(v));
  const reducer = (previousVersion, currentVersion) =>
    gte(currentVersion, previousVersion) ? currentVersion : previousVersion;
  return validVersions.reduce(reducer);
}

async function main() {
  const args = await readArguments();
  let packages = [];
  try {
    packages = JSON.parse(args);
  } catch (error) {
    console.error('Unable to get pckages to bump');
  }
  const allPackages = packages.map((p) => p.name);
  const allNextVersions = await Promise.all(
    allPackages.map((p) => getNextPatchVersion(p))
  );

  const greatestVersion = getGreatestVersion(allNextVersions);
  console.log(greatestVersion);
}

main();
