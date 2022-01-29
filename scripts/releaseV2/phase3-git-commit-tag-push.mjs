import {
  getCurrentVersion,
  gitCommit,
  gitTag,
  gitPush,
} from '@coveo/semantic-monorepo-tools';

// Commit, tag and push
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const releaseVersion = getCurrentVersion(PATH);
  gitCommit(
    `chore(release): Release ${versionPrefix}${releaseVersion} [skip ci]`,
    PATH
  );
  gitTag(releaseVersion, versionPrefix);
  // TODO PRE_NX: Enable gitPush
  //gitPush(); we don't want to push the tags while testing
})();
