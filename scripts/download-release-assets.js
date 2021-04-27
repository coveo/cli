const {downloadReleaseAssets, getLatestTag} = require('./github-client');
const fs = require('fs');
const path = require('path');

async function main() {
  const tag = await getLatestTag();
  // This folder structure needs to be respected in order for the CLI update plugin to
  // be able to do it's job properly.
  const topLevelDirectory = './artifacts';
  const subDirectoryForTarball = `${topLevelDirectory}/coveo-${tag}`;
  const binariesMatcher = /^coveo(_|-)(?<_version>v?\d+\.\d+\.\d+(-\d+)?)(?<longExt>.*\.(exe|deb|pkg))$/;

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

  const files = fs.readdirSync(topLevelDirectory, {withFileTypes: true});
  files.forEach((file) => {
    const match = binariesMatcher.exec(file.name);
    if (!match) {
      return;
    }
    const destName = `coveo-latest${match.groups.longExt}`;
    fs.copyFileSync(
      path.resolve(topLevelDirectory, file.name),
      path.resolve(topLevelDirectory, destName)
    );
  });
}

main();
