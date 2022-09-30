import {warning, exportVariable, setFailed} from '@actions/core';
import {context} from '@actions/github';
import {getLastTag} from '@coveo/semantic-monorepo-tools';

const releaseTagRegExp = /refs\/tags\/(release-\d+)/;
const releaseTagPrefix = 'release-';
const cliTagPrefix = '@coveo/cli@';

const getReleaseTag = async () => {
  if (context.eventName === 'workflow_dispatch') {
    return context.payload.inputs.version;
  }
  if (context.eventName === 'release') {
    const ref = context.ref;
    const match = releaseTagRegExp.exec(ref);
    if (match && match[1]) {
      return match[1];
    }
  }
  warning('Tag acquisition failed, fallbacking to the latest');
  return getLastTag(releaseTagPrefix);
};

const getCliVersion = async () =>
  'v' + (await getLastTag(cliTagPrefix)).split(cliTagPrefix)[1];

(async () => {
  try {
    const releaseTag = await getReleaseTag();
    exportVariable('tag', releaseTag);
    const cliReleaseVersion = await getCliVersion();
    exportVariable('cliversion', cliReleaseVersion);
  } catch (error) {
    setFailed(error.message);
  }
})();
