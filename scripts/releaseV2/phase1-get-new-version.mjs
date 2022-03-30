import {
  getLastTag,
  parseCommits,
  getCommits,
  getCurrentVersion,
  getNextVersion,
  npmBumpVersion,
} from '@coveo/semantic-monorepo-tools';
import angularChangelogConvention from 'conventional-changelog-angular';

// Get all commits since last release bump the root package.json version.
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const convention = await angularChangelogConvention;
  const lastTag = getLastTag(versionPrefix)[0];
  const commits = getCommits(PATH, lastTag)[0];
  const parsedCommits = parseCommits(commits, convention.parserOpts);
  const bumpInfo = convention.recommendedBumpOpts.whatBump(parsedCommits);
  const currentVersion = getCurrentVersion(PATH);
  const newVersion = getNextVersion(currentVersion, bumpInfo);
  console.log(`NEW VERSION ${newVersion}`);
  npmBumpVersion(newVersion, PATH);
})();
