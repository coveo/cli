const github = require('@actions/github');
const octokit = github.getOctokit('1494540bf76e7929c942e6963fa79945a2f98d63');
const owner = 'coveo';
const repo = 'cli';

const getPullRequestTitle = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.title;
};

const getPullRequestNumber = () => {
  return (
    (github.context.payload.pull_request &&
      github.context.payload.pull_request.number) ||
    0
  );
};

const getHeadBranchName = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.head.ref;
};

const getBaseBranchName = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.base.ref;
};

const getPullRequestComments = () => {
  const issue_number = getPullRequestNumber();
  return octokit.issues.listComments({repo, owner, issue_number});
};

const createPullRequestComment = (body) => {
  const issue_number = getPullRequestNumber();
  return octokit.issues.createComment({repo, owner, issue_number, body});
};

const updatePullRequestComment = (comment_id, body) => {
  return octokit.issues.updateComment({repo, owner, body, comment_id});
};

const getLatestTag = async () => {
  const tags = await octokit.repos.listTags({owner, repo});
  return tags.data[0].name;
};

const createOrUpdateReleaseDescription = async (tag, body) => {
  try {
    const release = await octokit.repos.getReleaseByTag({repo, owner, tag});
    await octokit.repos.updateRelease({
      repo,
      owner,
      release_id: release.data.id,
      body,
    });
  } catch (e) {
    if (e.status === 404) {
      await octokit.repos.createRelease({owner, repo, body, tag_name: tag});
    }
  }
};

module.exports = {
  getPullRequestTitle,
  getPullRequestComments,
  createPullRequestComment,
  updatePullRequestComment,
  getHeadBranchName,
  getBaseBranchName,
  getLatestTag,
  createOrUpdateReleaseBody: createOrUpdateReleaseDescription,
};
