/**
 * Because our release process creates release commits on our main branch,
 * it needs to reserve the branch when running, so that no 'new commits' come up.
 */

import {Octokit} from 'octokit';

const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';
const MAIN_BRANCH_NAME = 'master';
const COVEO_CLI_MASTER = {
  owner: REPO_OWNER,
  repo: REPO_NAME,
  branch: MAIN_BRANCH_NAME,
};
export const limitWriteAccessToBot = () => changeBranchRestrictions(true);

export const removeWriteAccessRestrictions = () =>
  changeBranchRestrictions(false);

/**
 * Lock/Unlock the main branch to only allow the 🤖 to write on it.
 * @param {boolean} onlyBot
 */
async function changeBranchRestrictions(onlyBot) {
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  if (onlyBot) {
    // Disallow direct write access to the team
    await octokit.rest.repos.setTeamAccessRestrictions({
      ...COVEO_CLI_MASTER,
      teams: [],
    });
    // Requires branches to be up to date before merging
    await octokit.rest.repos.updateStatusCheckProtection({
      ...COVEO_CLI_MASTER,
      strict: true,
    });
    // Requires admins to pass the status checks
    await octokit.rest.repos.setAdminBranchProtection(COVEO_CLI_MASTER);
  } else {
    // Allow direct write access to the team
    await octokit.rest.repos.setTeamAccessRestrictions({
      ...COVEO_CLI_MASTER,
      teams: ['dx'],
    });
    // Allow admins to bypass the status checks
    await octokit.rest.repos.deleteAdminBranchProtection(COVEO_CLI_MASTER);
    // Do not requires branches to be up to date before merging
    await octokit.rest.repos.updateStatusCheckProtection({
      ...COVEO_CLI_MASTER,
      strict: false,
    });
  }
}
