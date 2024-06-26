#!/usr/bin/env node

import {
  getLastTag,
  parseCommits,
  getCommits,
  npmBumpVersion,
  npmPublish,
  getCurrentVersion,
  getNextVersion,
  generateChangelog,
  writeChangelog,
  describeNpmTag,
} from '@coveo/semantic-monorepo-tools';
import {spawnSync} from 'node:child_process';
import {appendFileSync, readFileSync, writeFileSync} from 'node:fs';
// @ts-ignore no dts is ok
import angularChangelogConvention from 'conventional-changelog-angular';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import retry from 'async-retry';
import {inc, compareBuild, gt, SemVer} from 'semver';
import {json as fetchNpm} from 'npm-registry-fetch';

/**
 * Check if the package json in the provided folder has changed since the last commit
 * @param {string} directoryPath
 * @returns {boolean}
 */
const hasPackageJsonChanged = (directoryPath) => {
  const {stdout, stderr, status} = spawnSync(
    'git',
    ['diff', '--exit-code', 'package.json'],
    {
      cwd: directoryPath,
      encoding: 'utf-8',
      shell: process.platform === 'win32' ? 'powershell' : undefined,
    }
  );
  switch (status) {
    case 0:
      return false;
    case 1:
      return true;
    default:
      console.log(stdout);
      console.error(stderr);
      throw new Error(`git diff exited with statusCode ${status}`);
  }
};

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const isPrerelease = process.env.IS_PRERELEASE === 'true';

// Run on each package, it generate the changelog, install the latest dependencies that are part of the workspace, publish the package.
(async () => {
  const PATH = '.';
  const privatePackage = isPrivatePackage();
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  const versionPrefix = `${packageJson.name}@`;
  const convention = await angularChangelogConvention;
  // TODO: CDX-1147 Remove catch
  const lastTag = await getLastTag(versionPrefix).catch(() =>
    getLastTag('release-')
  );
  const commits = await getCommits(PATH, lastTag);
  if (commits.length === 0 && !hasPackageJsonChanged(PATH)) {
    return;
  }
  const parsedCommits = parseCommits(commits, convention.parserOpts);
  let currentGitVersion = getCurrentVersion(PATH);
  let currentNpmVersion = new SemVer(
    privatePackage
      ? '0.0.0' // private package does not have a npm version, so we default to the 'lowest' possible
      : await describeNpmTag(packageJson.name, 'latest')
  );
  const isRedo = gt(currentNpmVersion, currentGitVersion);
  const bumpInfo = isRedo
    ? {type: 'patch'}
    : convention.recommendedBumpOpts.whatBump(parsedCommits);
  const nextGoldVersion = getNextVersion(
    isRedo ? currentNpmVersion : currentGitVersion,
    bumpInfo
  );
  const newVersion =
    isPrerelease && !privatePackage
      ? await getNextBetaVersion(packageJson.name, nextGoldVersion)
      : nextGoldVersion;

  await npmBumpVersion(newVersion, PATH, {
    workspaceUpdateStrategy: 'UpdateExact',
  });
  await updateWorkspaceDependent(newVersion);
  if (privatePackage) {
    return;
  }

  if (parsedCommits.length > 0) {
    const changelog = await generateChangelog(
      parsedCommits,
      newVersion,
      {
        host: 'https://github.com',
        owner: 'coveo',
        repository: 'cli',
      },
      convention.writerOpts
    );
    await writeChangelog(PATH, changelog);
  }
  const tagToPublish = isPrerelease ? 'beta' : 'latest';
  await npmPublish('.', {tag: tagToPublish});

  await retry(
    async () => {
      if (
        (await describeNpmTag(packageJson.name, tagToPublish)) !== newVersion
      ) {
        throw new Error('Version not available');
      }
    },
    {retries: 30}
  );
  appendFileSync(
    join(rootFolder, '.git-message'),
    `${packageJson.name}@${newVersion}\n`
  );
})();

/**
 * Update the version of the package in the other packages of the workspace
 * @param {string} version
 */
async function updateWorkspaceDependent(version) {
  const topology = JSON.parse(
    readFileSync(join(rootFolder, 'topology.json'), {encoding: 'utf-8'})
  );
  const dependencyPackageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  const dependencyPackageName = dependencyPackageJson.name.replace(
    '@coveo/',
    ''
  );
  const dependentPackages = [];
  for (const [name, dependencies] of Object.entries(
    topology.graph.dependencies
  )) {
    if (
      dependencies.find(
        (/** @type {{target:string}} **/ dependency) =>
          dependency.target === dependencyPackageName
      )
    ) {
      dependentPackages.push(name);
    }
  }

  for (const dependentPackage of dependentPackages) {
    const dependentPackageJsonPath = join(
      rootFolder,
      topology.graph.nodes[dependentPackage].data.root,
      'package.json'
    );
    const dependentPackageJson = JSON.parse(
      readFileSync(dependentPackageJsonPath, {encoding: 'utf-8'})
    );
    updateDependency(dependentPackageJson, dependencyPackageJson.name, version);
    writeFileSync(
      dependentPackageJsonPath,
      JSON.stringify(dependentPackageJson)
    );
  }
}

/**
 * Update all instancies of the `dependency` in the `packageJson` to the given `version`.
 * @param {any} packageJson the packageJson object to update
 * @param {string} dependency the dependency to look for and update
 * @param {string} version the version to update to.
 */
function updateDependency(packageJson, dependency, version) {
  for (const dependencyType of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
  ]) {
    if (packageJson?.[dependencyType]?.[dependency]) {
      packageJson[dependencyType][dependency] = version;
    }
  }
}

function isPrivatePackage() {
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  return packageJson.private;
}

/**
 * Compute the next beta version of the package,
 * based on what the next gold version would be,
 * and the latest beta version published.
 *
 * @param {string} packageName
 * @param {string} nextGoldVersion
 * @returns {Promise<string>}
 */
async function getNextBetaVersion(packageName, nextGoldVersion) {
  let nextBetaVersion = `${nextGoldVersion}-0`;

  const registryMeta = await fetchNpm(packageName);

  /**
   * @type {string[]}
   */
  // @ts-ignore force-cast: `fetchNpm` do not returns a `Record<string,unknown>, which is hard to work with.
  const versions = Object.keys(registryMeta.versions);
  const nextGoldMatcher = new RegExp(`${nextGoldVersion}-\\d+`);
  const matchingPreReleasedVersions = versions
    .filter((version) => nextGoldMatcher.test(version))
    .sort(compareBuild);
  const lastPrerelease = matchingPreReleasedVersions.pop();
  if (lastPrerelease) {
    nextBetaVersion = inc(lastPrerelease, 'prerelease') ?? nextBetaVersion;
  }
  return nextBetaVersion;
}
