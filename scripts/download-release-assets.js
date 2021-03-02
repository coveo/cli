const {downloadReleaseAssets, getLatestTag} = require('./github-client');
const fs = require('fs');

async function main() {
  const tag = await getLatestTag();
  const directory = './artifacts';

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  await downloadReleaseAssets(tag, directory);
}

main();
