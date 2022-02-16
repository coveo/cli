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
} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import angularChangelogConvention from 'conventional-changelog-angular';
// Commit, tag and push
(async () => {
  const REPO_OWNER = 'coveo';
  const REPO_NAME = 'cli';
  const PATH = '.';
  const versionPrefix = 'v';
  const convention = await angularChangelogConvention;
  const lastTag = getLastTag(versionPrefix);
  const commits = getCommits(PATH, lastTag);
  const releaseVersion = getCurrentVersion(PATH);
  const versionTag = `${versionPrefix}${releaseVersion}`;
  let changelog = '';
  if (commits.length > 0) {
    const parsedCommits = parseCommits(commits, convention.parserOpts);
    changelog = await generateChangelog(
      parsedCommits,
      versionTag,
      {
        host: 'https://github.com',
        owner: REPO_OWNER,
        repository: REPO_NAME,
      },
      convention.writerOpts
    );
    await writeChangelog(PATH, changelog);
  }

  gitCommit(`chore(release): Release ${versionTag} [skip ci]`, PATH);
  gitTag(versionTag);
  gitPush();
  gitPushTags();

  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  const [, ...bodyArray] = changelog.split('\n');
  await octokit.rest.repos.createRelease({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tag_name: versionTag,
    name: `Release ${versionTag}`,
    body: bodyArray.join('\n'),
  });
})();
