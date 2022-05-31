import {
  getLastTag,
  parseCommits,
  getCommits,
  npmBumpVersion,
  npmPublish,
  generateChangelog,
  writeChangelog,
} from '@coveo/semantic-monorepo-tools';
import {spawnSync} from 'child_process';
import {readFileSync} from 'fs';
import angularChangelogConvention from 'conventional-changelog-angular';
import {waitForPackage} from './utils/wait-for-published-packages';
import {dirname, resolve, join} from 'path';
import {fileURLToPath} from 'url';
import retry from 'async-retry';

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Run on each package, it generate the changelog, install the latest dependencies that are part of the workspace, publish the package.
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const convention = await angularChangelogConvention;
  const lastTag = getLastTag(versionPrefix)[0];
  const commits = getCommits(PATH, lastTag)[0];
  const newVersion = getReleaseVersion();

  await updateWorkspaceDependencies(newVersion);
  npmBumpVersion(newVersion, PATH);

  if (isPrivatePackage()) {
    return;
  }

  if (commits.length > 0) {
    const parsedCommits = parseCommits(commits, convention.parserOpts);
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

  npmPublish();
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  await retry(
    () => {
      if (!isVersionPublished(packageJson.name, newVersion)) {
        throw 'Version not available';
      }
    },
    {retries: 30}
  );
})();

function getReleaseVersion() {
  return JSON.parse(
    readFileSync(join(rootFolder, 'package.json'), {encoding: 'utf-8'})
  ).version;
}

// TODO [PRE_NX]: Clean  this mess.
async function updateWorkspaceDependencies(version) {
  const topology = JSON.parse(
    readFileSync(join(rootFolder, 'topology.json'), {encoding: 'utf-8'})
  );
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  const packageName = packageJson.name.replace('@coveo/', '');
  const topologicalDependencies = topology.graph.dependencies[packageName]
    .filter((dependency) => dependency.source == packageName)
    .map((dependency) => `@coveo/${dependency.target}`);
  const npmDependencies = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ].reduce((acc, cur) => acc.concat(Object.keys(packageJson[cur] ?? [])));

  for (const dependency of topologicalDependencies) {
    if (npmDependencies.includes(dependency)) {
      await waitForPackage(dependency);
      await updateDependency(packageJson, dependency, version);
    }
  }
}

async function updateDependency(packageJson, dependency, version) {
  const npmInstallFlags = [];
  if (Object.hasOwn(packageJson.dependencies ?? {}, dependency)) {
    ('-P');
  }
  if (Object.hasOwn(packageJson.devDependencies ?? {}, dependency)) {
    ('-D');
  }
  if (Object.hasOwn(packageJson.optionalDependencies ?? {}, dependency)) {
    ('-O');
  }
  await retry(
    () => {
      const installChildProcess = spawnSync(appendCmdIfWindows`npm`, [
        'install',
        `${dependency}@${version}`,
        '-E',
        ...npmInstallFlags,
      ]);
      if (installChildProcess.error) {
        throw installChildProcess.error;
      }
    },
    {retries: 30}
  );
}

function isVersionPublished(packageName, version) {
  return (
    spawnSync(
      appendCmdIfWindows`npm`,
      ['show', `${packageName}@latest`, 'version'],
      {encoding: 'utf-8'}
    ).stdout.trim() === version
  );
}

export const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

function isPrivatePackage() {
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  return packageJson.private;
}
