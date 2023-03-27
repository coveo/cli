#!/usr/bin/env node

import {
  getLastTag,
  gitPull,
  parseCommits,
  getCommits,
  npmBumpVersion,
  npmPublish,
  getCurrentVersion,
  getNextVersion,
  generateChangelog,
  writeChangelog,
  describeNpmTag,
  getSHA1fromRef,
} from '@coveo/semantic-monorepo-tools';
import {spawnSync} from 'node:child_process';
import {appendFileSync, readFileSync, writeFileSync} from 'node:fs';
import angularChangelogConvention from 'conventional-changelog-angular';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import retry from 'async-retry';
import {inc, compareBuild, gte} from 'semver';
import {json as fetchNpm} from 'npm-registry-fetch';
import {changeMasterWriteAccess} from './lock-master.mjs';
import dedent from 'ts-dedent';
const hasPackageJsonChanged = (directoryPath) => {
  const {stdout, stderr, status} = spawnSync(
    'git',
    ['diff', '--exit-code', 'package.json'],
    {cwd: directoryPath, encoding: 'utf-8'}
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
  // Lock-out master
  await changeMasterWriteAccess(false);

  // Verify master has not changed
  const local = await getSHA1fromRef('master');
  await gitPull();
  const remote = await getSHA1fromRef('master');
  if (!process.env.NO_LOCK && local !== remote) {
    await changeMasterWriteAccess(true);
    throw new Error(dedent`
      master branch changed before lockout.
      pre-lock:${local}
      post-lock:${remote}
    `);
  }

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
  let currentNpmVersion = privatePackage
    ? '0.0.0' // private package does not have a npm version, so we default to the 'lowest' possible
    : await describeNpmTag(packageJson.name, 'latest');
  const isRedo = gte(currentNpmVersion, currentGitVersion);
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
        (dependency) => dependency.target === dependencyPackageName
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

export const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

function isPrivatePackage() {
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  return packageJson.private;
}

async function getNextBetaVersion(packageName, nextGoldVersion) {
  const registryMeta = await fetchNpm(packageName);
  const versions = Object.keys(registryMeta.versions);
  const nextGoldMatcher = new RegExp(`${nextGoldVersion}-\\d+`);
  const matchingPreReleasedVersions = versions
    .filter((version) => nextGoldMatcher.test(version))
    .sort(compareBuild);
  if (matchingPreReleasedVersions.length === 0) {
    return `${nextGoldVersion}-0`;
  }
  return inc(matchingPreReleasedVersions.pop(), 'prerelease');
}
