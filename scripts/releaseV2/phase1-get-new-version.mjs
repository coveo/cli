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
  let newVersion = process.env.VERSION;
  if (!newVersion) {
    const PATH = '.';
    const versionPrefix = 'v';
    const convention = await angularChangelogConvention;
    const lastTag = await getLastTag(versionPrefix);
    const commits = await getCommits(PATH, lastTag);
    const parsedCommits = parseCommits(commits, convention.parserOpts);
    const bumpInfo = convention.recommendedBumpOpts.whatBump(parsedCommits);
    const currentVersion = getCurrentVersion(PATH);
    newVersion = getNextVersion(currentVersion, bumpInfo);
  }
  console.log(`NEW VERSION ${newVersion}`);
  await npmBumpVersion(newVersion, PATH);
})();
