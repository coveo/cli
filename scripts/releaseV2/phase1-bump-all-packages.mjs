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
} from '@coveo/semantic-monorepo-tools';
import {spawnSync} from 'child_process';
import {appendFileSync, readFileSync, writeFileSync} from 'fs';
import angularChangelogConvention from 'conventional-changelog-angular';
import {dirname, resolve, join} from 'path';
import {fileURLToPath} from 'url';
import retry from 'async-retry';

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
// Run on each package, it generate the changelog, install the latest dependencies that are part of the workspace, publish the package.
(async () => {
  const PATH = '.';
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  const versionPrefix = packageJson.name;
  const convention = await angularChangelogConvention;
  // TODO: CDX-1147 Remove catch
  const lastTag = await getLastTag(versionPrefix).catch(() =>
    getLastTag('release-')
  );
  const commits = await getCommits(PATH, lastTag);
  if (commits.length === 0 && hasPackageJsonChanged(PATH)) {
    return;
  }
  const parsedCommits = parseCommits(commits, convention.parserOpts);
  const bumpInfo = convention.recommendedBumpOpts.whatBump(parsedCommits);
  const currentVersion = getCurrentVersion(PATH);
  const newVersion = getNextVersion(currentVersion, bumpInfo);

  await npmBumpVersion(newVersion, PATH, {
    workspaceUpdateStrategy: 'UpdateExact',
  });
  await updateWorkspaceDependent(newVersion);
  if (isPrivatePackage()) {
    return;
  }

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

  await npmPublish();

  await retry(
    () => {
      if (!isVersionPublished(packageJson.name, newVersion)) {
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
