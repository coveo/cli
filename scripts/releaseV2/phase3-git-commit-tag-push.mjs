import {
  parseCommits,
  generateChangelog,
  getCurrentVersion,
  gitCommit,
  gitTag,
  gitPush,
  createGitHubRelease,
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
  const parsedCommits = parseCommits(commits, convention.parserOpts);
  const releaseVersion = getCurrentVersion(PATH);
  const changelog = await generateChangelog(
    parsedCommits,
    releaseVersion,
    {
      host: 'https://github.com',
      owner: 'coveo',
      repository: 'cli',
    },
    convention.writerOpts
  );
  await writeChangelog(PATH, changelog);

  const versionTag = `${versionPrefix}${releaseVersion}`;

  gitCommit(`chore(release): Release ${versionTag} [skip ci]`, PATH);
  gitTag(versionTag);
  gitPush();

  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  await createGitHubRelease(
    octokit,
    changelog,
    versionTag,
    REPO_OWNER,
    REPO_NAME
  );
})();
