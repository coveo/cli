import {exportVariable, setFailed} from '@actions/core';
import {getSHA1fromRef} from '@coveo/semantic-monorepo-tools';

const getCommitShortHash = () => getSHA1fromRef('HEAD').substring(0, 7);

try {
  const commitShortHash = getCommitShortHash();
  exportVariable('commitSHA1', commitShortHash);
} catch (error) {
  setFailed(error.message);
}
