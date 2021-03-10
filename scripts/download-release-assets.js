const {downloadReleaseAssets, getLatestTag} = require('./github-client');
const fs = require('fs');

async function main() {
  const tag = await getLatestTag();
  // This folder structure needs to be respected in order for the CLI update plugin to
  // be able to do it's job properly.
  const topLevelDirectory = './artifacts';
  const subDirectoryForTarball = `${topLevelDirectory}/coveo-${tag}`;

  if (!fs.existsSync(topLevelDirectory)) {
    fs.mkdirSync(topLevelDirectory);
  }

  if (!fs.existsSync(subDirectoryForTarball)) {
    fs.mkdirSync(subDirectoryForTarball);
  }

  await downloadReleaseAssets(tag, (assetName) => {
    if (assetName.match(/\.tar\.gz$/)) {
      console.info(assetName, `--> ${subDirectoryForTarball}`);
      return subDirectoryForTarball;
    } else {
      console.info(assetName, `--> ${topLevelDirectory}`);
      return topLevelDirectory;
    }
  });
}

main();
