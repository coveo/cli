import {getReleaseAssetsMetadata, getLastCliTag} from './github-client.js';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
} from 'fs';
import {resolve} from 'path';
import {execSync} from 'node:child_process';

async function main() {
  const tag = await getLastCliTag();
  // This folder structure needs to be respected in order for the CLI update plugin to
  // be able to do it's job properly.
  const topLevelDirectory = './artifacts';
  const getSubDirectoryForTarball = ({version, commitSHA}) =>
    [topLevelDirectory, 'versions', version, commitSHA].join('/');
  const subDirectoryForManifest = [
    topLevelDirectory,
    'channels',
    'stable',
  ].join('/');
  const binariesMatcher =
    /^coveo[_-]{1}(?<version>v?\d+\.\d+\.\d+(-\d+)?)[_.-]{1}(?<commitSHA>\w+)[_-]?(\d+_)?(?<longExt>.*\.(exe|deb|pkg))$/;
  const manifestMatcher =
    /^coveo-(?<_version>v?\d+\.\d+\.\d+(-\d+)?)-(?<commitSHA>\w+)-(?<targetSignature>.*-buildmanifest)$/;
  const tarballMatcher =
    /^coveo-(?<_version>v?\d+\.\d+\.\d+(-\d+)?)-(?<commitSHA>\w+)-(?<targetSignature>[\w-]+).tar\.[gx]z$/;

  const determineAssetLocation = (assetName) => {
    if (assetName.match(tarballMatcher)) {
      const match = tarballMatcher.exec(assetName);
      const location = getSubDirectoryForTarball(match.groups);
      console.info(assetName, `--> ${location}`);
      return location;
    } else if (assetName.match(manifestMatcher)) {
      console.info(assetName, `--> ${subDirectoryForManifest}`);
      return subDirectoryForManifest;
    } else {
      console.info(assetName, `--> ${topLevelDirectory}`);
      return topLevelDirectory;
    }
  };

  [topLevelDirectory, subDirectoryForManifest, subDirectoryForTarball].forEach(
    (dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, {recursive: true});
      }
    }
  );

  const assets = await getReleaseAssetsMetadata(tag);
  for (const asset of assets) {
    console.info(
      `Downloading asset ${asset.name} from ${asset.browser_download_url}.\nSize: ${asset.size} ...`
    );
    const directory = determineAssetLocation(asset.name);
    execSync(
      `curl -L ${asset.browser_download_url} --output ${directory}/${asset.name}`
    );
  }

  writeFileSync('latest-commit', tagCommit);

  readdirSync(topLevelDirectory, {withFileTypes: true}).forEach((file) => {
    const match = binariesMatcher.exec(file.name);
    if (!match) {
      return;
    }
    const destName = `coveo-latest${
      /\w/.test(match.groups.longExt[0]) ? '-' : ''
    }${match.groups.longExt}`;
    copyFileSync(
      resolve(topLevelDirectory, file.name),
      resolve(topLevelDirectory, destName)
    );
  });

  readdirSync(subDirectoryForManifest).forEach((file) => {
    const match = manifestMatcher.exec(file);
    if (!match) {
      return;
    }
    const destName = `coveo-${match.groups.targetSignature}`;
    copyFileSync(
      resolve(subDirectoryForManifest, file),
      resolve(subDirectoryForManifest, destName)
    );
  });
}

main();
