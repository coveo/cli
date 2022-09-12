import {exportVariable, setFailed} from '@actions/core';
import {getSHA1fromRef} from '@coveo/semantic-monorepo-tools';

const getCommitShortHash = async () =>
  (await getSHA1fromRef('HEAD')).substring(0, 7);

(async () => {
  try {
    const commitShortHash = await getCommitShortHash();
    exportVariable('commitSHA1', commitShortHash);
  } catch (error) {
    setFailed(error.message);
  }
})();
