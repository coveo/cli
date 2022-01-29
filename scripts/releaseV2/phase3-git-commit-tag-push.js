import {
  getCurrentVersion,
  gitCommit,
  gitTag,
} from '@coveo/semantic-monorepo-tools';

// Get all commits since last release bump the root package.json version.
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const releaseVersion = getCurrentVersion(PATH);
  gitCommit(
    `chore(release): Release ${versionPrefix}${releaseVersion} [skip ci]`,
    PATH
  );
  gitTag(releaseVersion, versionPrefix);
})();
