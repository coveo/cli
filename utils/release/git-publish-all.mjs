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
  gitCreateBranch,
  gitCheckoutBranch,
  gitAdd,
  gitWriteTree,
  gitCommitTree,
  gitUpdateRef,
  gitPublishBranch,
  gitSetRefOnCommit,
  gitPush,
  gitSetupSshRemote,
  gitSetupUser,
} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import {createAppAuth} from '@octokit/auth-app';
// @ts-ignore no dts is ok.
import angularChangelogConvention from 'conventional-changelog-angular';
import {dedent} from 'ts-dedent';
import {readFileSync, writeFileSync, existsSync} from 'fs';
import {removeWriteAccessRestrictions} from './lock-master.mjs';
import {spawnSync} from 'child_process';

const setupGit = async () => {
  const GIT_USERNAME = 'developer-experience-bot[bot]';
  const GIT_EMAIL =
    '91079284+developer-experience-bot[bot]@users.noreply.github.com';
  const DEPLOY_KEY = process.env.DEPLOY_KEY;
  if (DEPLOY_KEY === undefined) {
    throw new Error('Deploy key is undefined');
  }

  await gitSetupUser(GIT_USERNAME, GIT_EMAIL);
  await gitSetupSshRemote(REPO_OWNER, REPO_NAME, DEPLOY_KEY, GIT_SSH_REMOTE);
};

/**
 * Update usage section at the root readme.
 */
function updateRootReadme() {
  const usageRegExp = /^<!-- usage -->(.|\n)*<!-- usagestop -->$/m;
  const cliReadme = readFileSync('packages/cli/core/README.md', 'utf-8');
  let rootReadme = readFileSync('README.md', 'utf-8');
  const cliUsage = usageRegExp.exec(cliReadme)?.[0];
  if (!cliUsage) {
    return;
  }

  writeFileSync('README.md', rootReadme.replace(usageRegExp, cliUsage));
}

/**
 * Append `.cmd` to the input if the runtime OS is Windows.
 * @param {string|TemplateStringsArray} cmd
 * @returns
 */
const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;

/**
 * Run `npm run pre-commit`
 */
function runPrecommit() {
  spawnSync(appendCmdIfWindows`npm`, ['run', 'pre-commit'], {
    shell: process.platform === 'win32' ? 'powershell' : undefined,
  });
}

/**
 * "Craft" the signed release commit.
 * @param {string|number} releaseNumber
 * @param {string} commitMessage
 * @param {Octokit} octokit
 * @returns {Promise<string>}
 */
async function commitChanges(releaseNumber, commitMessage, octokit) {
  // Get latest commit and name of the main branch.
  const mainBranchName = await getCurrentBranchName();
  const mainBranchCurrentSHA = await getSHA1fromRef(mainBranchName);

  // Create a temporary branch and check it out.
  const tempBranchName = `release/${releaseNumber}`;
  await gitCreateBranch(tempBranchName);
  await gitCheckoutBranch(tempBranchName);
  // Stage all the changes...
  await gitAdd('.');
  // ... run pre-commit (only run with `git commit`)...`
  runPrecommit();
  //... and create a Git tree object with the changes. The Tree SHA will be used with GitHub APIs.
  const treeSHA = await gitWriteTree();
  // Create a new commit that references the Git tree object.
  const commitTree = await gitCommitTree(treeSHA, tempBranchName, 'tempcommit');

  // Update the HEAD of the temp branch to point to the new commit, then publish the temp branch.
  await gitUpdateRef('HEAD', commitTree);
  await gitPublishBranch('origin', tempBranchName);

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
  await gitSetRefOnCommit(
    GIT_SSH_REMOTE,
    `refs/heads/${mainBranchName}`,
    commit.data.sha,
    true
  );
  await gitPush({remote: GIT_SSH_REMOTE, refs: [mainBranchName], force: true});

  // Delete the temp branch
  await gitDeleteRemoteBranch('origin', tempBranchName);
  return commit.data.sha;
}

const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';
const GIT_SSH_REMOTE = 'deploy';

// Commit, tag and push
const PATH = '.';

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

await setupGit();

// Define release # andversion
const currentVersionTag = getCurrentVersion(PATH);
currentVersionTag.inc('prerelease');
const npmNewVersion = currentVersionTag.format();
// Write release version in the root package.json
await npmBumpVersion(npmNewVersion, PATH);

const releaseNumber = currentVersionTag.prerelease[0];
const gitNewTag = `release-${releaseNumber}`;

// Find all changes since last release and generate the changelog.
const versionPrefix = 'release-';
const lastTag = await getLastTag(versionPrefix);
const commits = await getCommits(PATH, lastTag);
const convention = await angularChangelogConvention;

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

// Find all packages that have been released in this release.
const packagesReleased = existsSync('.git-message')
  ? readFileSync('.git-message', {
      encoding: 'utf-8',
    }).trim()
  : '';

// Compile git commit message
const commitMessage = dedent`
    [version bump] chore(release): release ${gitNewTag} [skip ci]

    ${packagesReleased}

    **/README.md
    **/CHANGELOG.md
    **/package.json
    **/*.snap
    README.md
    CHANGELOG.md
    package.json
    package-lock.json
    packages/ui/cra-template/template.json
  `;

// Craft the commit (complex process, see function)
const commit = await commitChanges(releaseNumber, commitMessage, octokit);

// Add the tags locally...
for (const tag of packagesReleased
  .split('\n')
  .filter((value) => !!value)
  .concat(gitNewTag)) {
  await gitTag(tag, commit);
}

// And push them
await gitPushTags();

// Unlock the main branch
await removeWriteAccessRestrictions();
