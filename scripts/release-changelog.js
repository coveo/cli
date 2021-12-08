const {
  getLatestTag,
  createOrUpdateReleaseDescription,
} = require('./github-client');
const fs = require('fs');

async function main() {
  const tag = (await getLatestTag()).name;
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const changelogVersioned = changelog.split(/^#{1,2} .*$/gm); //Lines starting with one or two `#` are separator
  const changelogLastVersion = changelogVersioned[2].trim(); // Third paragraph because: 0 is before the header (empty str), 1 is just after `# changelog` (all notable changes etc), 2 is the latest release
  await createOrUpdateReleaseDescription(tag, changelogLastVersion);
}

main();
