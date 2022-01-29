import {
  getLastTag,
  parseCommits,
  getCommits,
  angular,
  getCurrentVersion,
  getNextVersion,
  npmBumpVersion,
} from '@coveo/semantic-monorepo-tools';

// Get all commits since last release bump the root package.json version.
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const awaitedangular = await angular;
  const lastTag = getLastTag(versionPrefix);
  const commits = getCommits(PATH, lastTag);
  const parsedCommits = parseCommits(commits, awaitedangular.parserOpts);
  const bumpInfo = awaitedangular.recommendedBumpOpts.whatBump(parsedCommits);
  const currentVersion = getCurrentVersion(PATH);
  const newVersion = getNextVersion(currentVersion, bumpInfo);
  console.log(`NEW VERSION ${newVersion}`);
  npmBumpVersion(newVersion, PATH);
})();
