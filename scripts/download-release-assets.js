const {downloadReleaseAssets, getLatestTag} = require('./github-client');
const fs = require('fs');

async function main() {
  let tag = '';
  const directory = './artifacts';

  if (process.argv[2]) {
    tag = process.argv[2];
  } else {
    tag = await getLatestTag();
  }

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  await downloadReleaseAssets(tag, directory);
}

main();
