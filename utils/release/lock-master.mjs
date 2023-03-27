import {Octokit} from 'octokit';

const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';

export async function changeMasterWriteAccess(canWrite) {
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});

  const currentProtection = await octokit.rest.repos.getBranchProtection({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    branch: 'master',
  });

  await octokit.rest.repos.updateBranchProtection({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    branch: 'master',
    ...currentProtection,
    lock_branch: !canWrite,
  });
}
