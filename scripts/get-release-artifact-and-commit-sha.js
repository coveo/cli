const {downloadReleaseAssets, getLatestTag} = require('./github-client');
const fs = require('fs');
const path = require('path');

async function main() {
  const tag = await getLatestTag();
  // This folder structure needs to be respected in order for the CLI update plugin to
  // be able to do it's job properly.
  const topLevelDirectory = './artifacts';
  const subDirectoryForTarball = [
    topLevelDirectory,
    'versions',
    tag.name.substring(1),
    tag.commit.sha.substring(0, 7),
  ].join('/');
  const subDirectoryForManifest = [
    topLevelDirectory,
    'channels',
    'stable',
  ].join('/');
  const binariesMatcher =
    /^coveo[_-]{1}(?<_version>v?\d+\.\d+\.\d+(-\d+)?)[_-]{1}\w{7}[_-]{1}(?<longExt>.*\.(exe|deb|pkg))$/;
  const manifestMatcher = /^coveo-.*-buildmanifest$/;
  const tarballMatcher = /\.tar\.[gx]z$/;

  [topLevelDirectory, subDirectoryForManifest, subDirectoryForTarball].forEach(
    (dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
      }
    }
  );

  await downloadReleaseAssets(tag.name, (assetName) => {
    if (assetName.match(tarballMatcher)) {
      console.info(assetName, `--> ${subDirectoryForTarball}`);
      return subDirectoryForTarball;
    } else if (assetName.match(manifestMatcher)) {
      console.info(assetName, `--> ${subDirectoryForManifest}`);
      return subDirectoryForManifest;
    } else {
      console.info(assetName, `--> ${topLevelDirectory}`);
      return topLevelDirectory;
    }
  });

  fs.writeFileSync('latest-commit', tag.commit.sha);

  const files = fs.readdirSync(topLevelDirectory, {withFileTypes: true});
  files.forEach((file) => {
    const match = binariesMatcher.exec(file.name);
    if (!match) {
      return;
    }
    const destName = `coveo-latest-${match.groups.longExt}`;
    fs.copyFileSync(
      path.resolve(topLevelDirectory, file.name),
      path.resolve(topLevelDirectory, destName)
    );
  });
}

main();
