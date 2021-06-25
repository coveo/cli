/** @type {import("@actions/core")} */
const core = require('@actions/core');
/** @type {import("@actions/github")} */
const github = require('@actions/github');
const {getLatestTag} = require('./github-client');

const tagRegExp = /refs\/tags\/(v[\d.]+)/;

const getTag = async () => {
  if (github.context.eventName === 'workflow_dispatch') {
    return github.context.payload.inputs.version;
  }
  if (github.context.eventName === 'release') {
    const ref = github.context.ref;
    const match = tagRegExp.exec(ref);
    if (match && match[1]) {
      return match[1];
    }
  }
  core.warning('Tag acquisition failed, fallbacking to the latest');
  return await getLatestTag();
};

(async () => {
  try {
    const tag = await getTag();
    core.exportVariable('tag', tag);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
