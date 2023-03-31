import {Octokit} from 'octokit';

const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';
const MAIN_BRANCH_NAME = 'master';

export const limitWriteAccessToBot = () => changeBranchRestrictions(true);

export const removeWriteAccessRestrictions = () =>
  changeBranchRestrictions(false);

async function changeBranchRestrictions(onlyBot) {
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  if (onlyBot) {
    await octokit.rest.repos.setTeamAccessRestrictions({
      branch: MAIN_BRANCH_NAME,
      owner: REPO_OWNER,
      repo: REPO_NAME,
      teams: [],
    });
    await octokit.rest.repos.setAdminBranchProtection({
      branch: MAIN_BRANCH_NAME,
      owner: REPO_OWNER,
      repo: {},
    });
  } else {
    await octokit.rest.repos.setTeamAccessRestrictions({
      branch: MAIN_BRANCH_NAME,
      owner: REPO_OWNER,
      repo: REPO_NAME,
      teams: ['dx'],
    });
    await octokit.rest.repos.setAdminBranchProtection({
      branch: MAIN_BRANCH_NAME,
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });
  }
}
