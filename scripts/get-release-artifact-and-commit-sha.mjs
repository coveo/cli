import {downloadReleaseAssets} from './github-client';
import {getLastTag} from '@coveo/semantic-monorepo-tools';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
} from 'fs';
import {resolve} from 'path';

async function main() {
  const tag = await getLastTag('@coveo/cli@');
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
    /^coveo[_-]{1}(?<_version>v?\d+\.\d+\.\d+(-\d+)?)[_.-]{1}(?<_commitSHA>\w{7})[_-]{0,1}(\d+_)?(?<longExt>.*\.(exe|deb|pkg))$/;
  const manifestMatcher =
    /^coveo-(?<_version>v?\d+\.\d+\.\d+(-\d+)?)-(?<_commitSHA>\w{7})-(?<targetSignature>.*-buildmanifest)$/;
  const tarballMatcher = /\.tar\.[gx]z$/;

  [topLevelDirectory, subDirectoryForManifest, subDirectoryForTarball].forEach(
    (dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, {recursive: true});
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

  writeFileSync('latest-commit', tag.commit.sha);

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
