import {
  getLastTag,
  parseCommits,
  getCommits,
  angular,
  npmBumpVersion,
  generateChangelog,
  writeChangelog,
} from '@coveo/semantic-monorepo-tools';
import {readFileSync} from 'fs';

// Get all commits since last release bump the root package.json version.
(async () => {
  const PATH = '.';
  const versionPrefix = 'v';
  const awaitedangular = await angular;
  const lastTag = getLastTag(versionPrefix);
  const commits = getCommits(PATH, lastTag);
  const parsedCommits = parseCommits(commits, awaitedangular.parserOpts);
  const newVersion = getReleaseVersion();
  const changelog = await generateChangelog(
    parsedCommits,
    newVersion,
    {
      host: 'https://github.com',
      owner: 'coveo',
      repository: 'cli',
    },
    awaitedangular.writerOpts
  );
  await writeChangelog(PATH, changelog);
  npmBumpVersion(newVersion, PATH);
})();

function getReleaseVersion() {
  return JSON.parse(readFileSync('../../package.json', {encoding: 'utf-8'}))
    .version;
}
