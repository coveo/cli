const {getLatestTag, createOrUpdateReleaseBody} = require('./github-client');
const fs = require('fs');

async function main() {
  const tag = await getLatestTag();
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  await createOrUpdateReleaseBody(tag, changelog);
}

main();
