import {readFileSync} from 'node:fs';
import {Octokit} from 'octokit';
import {createAppAuth} from '@octokit/auth-app';
import {exportVariable} from '@actions/core';

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
async () => {
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

  const packagesReleased = readFileSync('.git-message', {
    encoding: 'utf-8',
  }).trim();

  // If `@coveo/cli` has not been released stop there, otherwise, create a GitHub release.
  const cliReleaseInfoMatch = CLI_PKG_MATCHER.exec(packagesReleased);
  if (!cliReleaseInfoMatch) {
    return;
  }
  const releaseBody = getCliChangelog();
  const cliLatestTag = cliReleaseInfoMatch[0];
  const cliVersion = cliReleaseInfoMatch?.groups?.version;
  await octokit.rest.repos.createRelease({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tag_name: cliLatestTag,
    name: `Release v${cliVersion}`,
    body: releaseBody,
  });
  exportVariable('tag', cliLatestTag);
};
