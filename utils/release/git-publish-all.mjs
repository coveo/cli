#!/usr/bin/env node

import {
  getLastTag,
  parseCommits,
  getCurrentVersion,
  generateChangelog,
  writeChangelog,
  getCommits,
  getCurrentBranchName,
  gitTag,
  gitDeleteRemoteBranch,
  gitPushTags,
  npmBumpVersion,
  getSHA1fromRef,
} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import {createAppAuth} from '@octokit/auth-app';
import angularChangelogConvention from 'conventional-changelog-angular';
import {dedent} from 'ts-dedent';
import {readFileSync, writeFileSync} from 'fs';
import {removeWriteAccessRestrictions} from './lock-master.mjs';
const CLI_PKG_MATCHER = /^@coveo\/cli@(?<version>\d+\.\d+\.\d+)$/gm;
const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';

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
  const PATH = '.';
  const GIT_USERNAME = 'developer-experience-bot[bot]';
  const GIT_EMAIL =
    '91079284+developer-experience-bot[bot]@users.noreply.github.com';
  const GIT_SSH_REMOTE = 'deploy';
  //#endregion

  // #region Setup Git
  await gitSetupSshRemote(
    REPO_OWNER,
    REPO_NAME,
    process.env.DEPLOY_KEY,
    GIT_SSH_REMOTE
  );
  await gitSetupUser(GIT_USERNAME, GIT_EMAIL);
  // #endregion

  //#region GitHub authentication
  const authSecrets = {
    appId: process.env.RELEASER_APP_ID,
    privateKey: process.env.RELEASER_PRIVATE_KEY,
    clientId: process.env.RELEASER_CLIENT_ID,
    clientSecret: process.env.RELEASER_CLIENT_SECRET,
    installationId: process.env.RELEASER_INSTALLATION_ID,
  };

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: authSecrets,
  });
  //#endregion

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
  const releaseNumber = currentVersionTag.prerelease;
  const gitNewTag = `release-${releaseNumber}`;
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

  const commit = await commitChanges(
    releaseNumber,
    gitNewTag,
    packagesReleased,
    octokit
  );

  // Add the tags locally...
  for (const tag of packagesReleased.split('\n').concat(gitNewTag)) {
    await gitTag(tag, commit);
  }

  // And push them
  await gitPushTags();

  // Unlock the main branch
  await removeWriteAccessRestrictions();

  // If `@coveo/cli` has not been released stop there, otherwise, create a GitHub release.
  const cliReleaseInfoMatch = CLI_PKG_MATCHER.exec(packagesReleased);
  if (!cliReleaseInfoMatch) {
    return;
  }
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

async function commitChanges(
  releaseNumber,
  gitNewTag,
  packagesReleased,
  octokit
) {
  // Get latest commit and name of the main branch.
  const mainBranchName = await getCurrentBranchName();
  const mainBranchCurrentSHA = await getSHA1fromRef(mainBranchName);

  // Create a temporary branch and check it out.
  const tempBranchName = `release/${releaseNumber}`;
  await gitCreateBranch(tempBranchName);
  await gitCheckoutBranch(tempBranchName);

  // Stage all the changes...
  await gitAdd('.');
  //... and create a Git tree object with the changes. The Tree SHA will be used with GitHub APIs.
  const treeSHA = await gitWriteTree();
  // Create a new commit that references the Git tree object.
  const commitTree = await gitCommitTree(treeSHA, tempBranchName, 'tempcommit');

  // Update the HEAD of the temp branch to point to the new commit, then publish the temp branch.
  await gitUpdateRef('HEAD', commitTree);
  await gitPublishBranch('origin', tempBranchName);

  // Compile the git message
  const commitMessage = dedent`
  [version bump] chore(release): release ${gitNewTag} [skip ci]

  ${packagesReleased}

  **/README.md
  **/CHANGELOG.md
  **/package.json
  README.md
  CHANGELOG.md
  package.json
  package-lock.json
  packages/ui/cra-template/template.json
  `;

  /**
   * Once we pushed the temp branch, the tree object is then known to the remote repository.
   * We can now create a new commit that references the tree object using the GitHub API.
   * The fact that we use the API makes the commit 'verified'.
   * The commit is directly created on the GitHub repository, not on the local repository.
   */
  const commit = await octokit.rest.git.createCommit({
    message: commitMessage,
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tree: treeSHA,
    parents: [mainBranchCurrentSHA],
  });

  /**
   * We then update the mainBranch to this new verified commit.
   */
  await octokit.rest.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `refs/heads/${mainBranchName}`,
    sha: commit.data.sha,
  });

  // Delete the temp branch
  await gitDeleteRemoteBranch('origin', tempBranchName);
  return commit.data.sha;
}

function updateRootReadme() {
  const usageRegExp = /^<!-- usage -->(.|\n)*<!-- usagestop -->$/m;
  const cliReadme = readFileSync('packages/cli/core/README.md', 'utf-8');
  let rootReadme = readFileSync('README.md', 'utf-8');
  const cliUsage = usageRegExp.exec(cliReadme);
  rootReadme.replace(usageRegExp, cliUsage[0]);
  writeFileSync('README.md', rootReadme);
}
