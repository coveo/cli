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
import {readFileSync, writeFileSync} from 'fs';

const CLI_PKG_MATCHER = /^@coveo\/cli@(?<version>\d+\.\d+\.\d+)$/gm;

const getCliChangelog = () => {
  const changelog = readFileSync('packages/cli/core/CHANGELOG.md', {
    encoding: 'utf-8',
  });
  const versionH1Matcher = /^#+ \d+\.\d+\.\d+.*$/gm;
  const lastVersionChanges = changelog.split(versionH1Matcher)[1];
  return lastVersionChanges.trim();
};

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
  updateRootReadme();
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
  const cliReleaseInfoMatch = CLI_PKG_MATCHER.exec(packagesReleased);
  if (!cliReleaseInfoMatch) {
    return;
  }
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  const releaseBody = getCliChangelog();
  const cliLatestTag = cliReleaseInfoMatch[0];
  const cliVersion = cliReleaseInfoMatch.groups.version;
  await octokit.rest.repos.createRelease({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tag_name: cliLatestTag,
    name: `Release v${cliVersion}`,
    body: releaseBody,
  });
})();

function updateRootReadme() {
  const usageRegExp = /^<!-- usage -->(.|\n)*<!-- usagestop -->$/m;
  const cliReadme = readFileSync('packages/cli/core/README.md', 'utf-8');
  let rootReadme = readFileSync('README.md', 'utf-8');
  const cliUsage = usageRegExp.exec(cliReadme);
  rootReadme.replace(usageRegExp, cliUsage[0]);
  writeFileSync('README.md', rootReadme);
}
