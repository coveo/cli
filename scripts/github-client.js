/** @type {import("@actions/github")} */
const github = require('@actions/github');
const {execSync} = require('child_process');
const octokit = github.getOctokit(process.env.GITHUB_CREDENTIALS);
const owner = 'coveo';
const repo = 'cli';

const getPullRequestTitle = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.rest.pulls.get({owner, repo, pull_number})).data.title;
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
  return (await octokit.rest.pulls.get({owner, repo, pull_number})).data.head
    .ref;
};

const getBaseBranchName = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.rest.pulls.get({owner, repo, pull_number})).data.base
    .ref;
};

const getPullRequestComments = () => {
  const issue_number = getPullRequestNumber();
  return octokit.rest.issues.listComments({repo, owner, issue_number});
};

const createPullRequestComment = (body) => {
  const issue_number = getPullRequestNumber();
  return octokit.rest.issues.createComment({repo, owner, issue_number, body});
};

const updatePullRequestComment = (comment_id, body) => {
  return octokit.rest.issues.updateComment({repo, owner, body, comment_id});
};

const getLatestTag = async () => {
  const tags = await octokit.rest.repos.listTags({owner, repo});
  return tags.data[0];
};

const createOrUpdateReleaseDescription = async (tag, body) => {
  try {
    const release = await octokit.rest.repos.getReleaseByTag({
      repo,
      owner,
      tag,
    });
    await octokit.rest.repos.updateRelease({
      repo,
      owner,
      release_id: release.data.id,
      body,
    });
  } catch (e) {
    if (e.status === 404) {
      await octokit.rest.repos.createRelease({
        owner,
        repo,
        body,
        tag_name: tag,
      });
    } else {
      console.error(e);
    }
  }
};

const downloadReleaseAssets = async (tag, determineAssetLocation) => {
  const release = await octokit.rest.repos.getReleaseByTag({repo, owner, tag});
  const assets = await octokit.rest.repos.listReleaseAssets({
    owner,
    repo,
    release_id: release.data.id,
  });

  assets.data.forEach((asset) => {
    console.info(
      `Downloading asset ${asset.name} from ${asset.browser_download_url}.\nSize: ${asset.size} ...`
    );
    const directory = determineAssetLocation(asset.name);
    execSync(
      `curl -L ${asset.browser_download_url} --output ${directory}/${asset.name}`
    );
  });
};

const getSnykCodeAlerts = () => {
  return octokit.rest.codeScanning.listAlertsForRepo({
    owner,
    repo,
    ref: 'master',
    tool_name: 'SnykCode',
    state: 'open',
  });
};

module.exports = {
  getPullRequestTitle,
  getPullRequestComments,
  createPullRequestComment,
  updatePullRequestComment,
  getHeadBranchName,
  getBaseBranchName,
  getLatestTag,
  createOrUpdateReleaseDescription,
  downloadReleaseAssets,
  getSnykCodeAlerts,
};
