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
import {readFileSync, writeFileSync} from 'fs';
import angularChangelogConvention from 'conventional-changelog-angular';
import {dirname, resolve, join} from 'path';
import {fileURLToPath} from 'url';
import retry from 'async-retry';

const rootFolder = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Run on each package, it generate the changelog, install the latest dependencies that are part of the workspace, publish the package.
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const convention = await angularChangelogConvention;
  const lastTag = await getLastTag(versionPrefix);
  const commits = await getCommits(PATH, lastTag);
  const newVersion = getReleaseVersion();

  await npmBumpVersion(newVersion, PATH, {
    workspaceUpdateStrategy: 'UpdateExact',
  });

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

  await npmPublish();
})();

function getReleaseVersion() {
  return JSON.parse(
    readFileSync(join(rootFolder, 'package.json'), {encoding: 'utf-8'})
  ).version;
}

export const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

function isPrivatePackage() {
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  return packageJson.private;
}
