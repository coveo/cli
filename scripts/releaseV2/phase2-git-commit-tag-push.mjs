import {
  getLastTag,
  parseCommits,
  getCurrentVersion,
  generateChangelog,
  writeChangelog,
  getCommits,
  gitCommit,
  gitTag,
  gitPush,
  gitPushTags,
  npmBumpVersion,
} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import angularChangelogConvention from 'conventional-changelog-angular';
import {dedent} from 'ts-dedent';
import {readFileSync} from 'fs';
// Commit, tag and push
(async () => {
  const REPO_OWNER = 'coveo';
  const REPO_NAME = 'cli';
  const PATH = '.';
  const versionPrefix = 'release-';
  const convention = await angularChangelogConvention;
  const lastTag = await getLastTag(versionPrefix);
  const commits = await getCommits(PATH, lastTag);
  const packagesReleased = readFileSync('.git-message', {
    encoding: 'utf-8',
  }).trim();
  const currentVersionTag = getCurrentVersion(PATH);
  currentVersionTag.inc('prerelease');
  const npmNewVersion = currentVersionTag.format();
  const gitNewTag = `release-${currentVersionTag.prerelease}`;
  await npmBumpVersion(npmNewVersion);

  let changelog = '';
  if (commits.length > 0) {
    const parsedCommits = parseCommits(commits, convention.parserOpts);
    changelog = await generateChangelog(
      parsedCommits,
      gitNewTag,
      {
        host: 'https://github.com',
        owner: REPO_OWNER,
        repository: REPO_NAME,
      },
      convention.writerOpts
    );
    await writeChangelog(PATH, changelog);
  }

  await gitCommit(
    dedent`
    [version bump] chore(release): release ${gitNewTag} [skip ci]

    ${packagesReleased}

    **/README.md
    **/CHANGELOG.md
    **/package.json
    README.md
    CHANGELOG.md
    package.json
    package-lock.json
    `,
    PATH
  );
  for (const tag of packagesReleased.split('\n').concat(gitNewTag)) {
    await gitTag(tag);
  }
  await gitPush();
  await gitPushTags();
  if (!packagesReleased.includes('@coveo/cli')) {
    return;
  }
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  const [, ...bodyArray] = changelog.split('\n');
  const cliVersion = (await getLastTag('@coveo/cli')).split('@coveo/cli@')[1];
  await octokit.rest.repos.createRelease({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tag_name: gitNewTag,
    name: `Release ${cliVersion}`,
    body: bodyArray.join('\n'),
  });
})();
