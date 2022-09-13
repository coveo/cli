/** @type {import("@actions/core")} */
const core = require('@actions/core');
/** @type {import("@actions/github")} */
const github = require('@actions/github');
const {getLastTag} = require('@coveo/semantic-monorepo-tools');

const releaseTagRegExp = /refs\/tags\/(release-\d+)/;
const releaseTagPrefix = 'release-';
const cliTagPrefix = '@coveo/cli@';

const getReleaseTag = async () => {
  if (github.context.eventName === 'workflow_dispatch') {
    return github.context.payload.inputs.version;
  }
  if (github.context.eventName === 'release') {
    const ref = github.context.ref;
    const match = releaseTagRegExp.exec(ref);
    if (match && match[1]) {
      return match[1];
    }
  }
  core.warning('Tag acquisition failed, fallbacking to the latest');
  return getLastTag(releaseTagPrefix);
};

const getCliVersion = async () =>
  'v' + (await getLastTag(cliTagPrefix)).split(cliTagPrefix)[1];

(async () => {
  try {
    const releaseTag = await getReleaseTag();
    core.exportVariable('tag', releaseTag);
    const cliReleaseVersion = await getCliVersion();
    core.exportVariable('cliversion', cliReleaseVersion);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
