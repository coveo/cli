import {Octokit} from 'octokit';

const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';

export const limitWriteAccessToBot = () =>
  changeBranchRestrictions({
    users: [],
    apps: ['developer-experience-bot'],
    teams: [],
  });

export const removeWriteAccessRestrictions = () =>
  changeBranchRestrictions(null);

async function changeBranchRestrictions(restrictions) {
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});

  const currentProtection = (
    await octokit.rest.repos.getBranchProtection({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      branch: 'master',
    })
  ).data;

  await octokit.rest.repos.updateBranchProtection({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    branch: 'master',
    ...currentProtection,
    restrictions,
  });
}
