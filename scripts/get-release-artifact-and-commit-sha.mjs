import {
  getAssetsMetadataFromRelease,
  getLastCliRelease,
  getTagFromRelease,
} from './github-client.js';
import {mkdirSync, writeFileSync, readdirSync, copyFileSync} from 'fs';
import {resolve, join} from 'path';
import {execSync} from 'node:child_process';
import {spawnSync} from 'child_process';
import {
  binariesMatcher,
  manifestMatcher,
  tarballMatcher,
} from './oclifArtifactMatchers.mjs';

async function main() {
  const release = await getLastCliRelease();
  const tag = getTagFromRelease(release);
  // This folder structure needs to be respected in order for the CLI update plugin to
  // be able to do it's job properly.
  const topLevelDirectory = './artifacts';
  const getSubDirectoryForTarball = ({version, commitSHA}) =>
    join(topLevelDirectory, 'versions', version, commitSHA);
  const subDirectoryForManifest = join(topLevelDirectory, 'channels', 'stable');

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

  const assets = await getAssetsMetadataFromRelease(release);
  for (const asset of assets) {
    console.info(
      `Downloading asset ${asset.name} from ${asset.browser_download_url}.\nSize: ${asset.size} ...`
    );
    const directory = determineAssetLocation(asset.name);
    mkdirSync(directory, {recursive: true});
    execSync(
      `curl -L ${asset.browser_download_url} --output ${directory}/${asset.name}`
    );
  }
  console.log('tag:', tag);
  // https://stackoverflow.com/a/1862542
  const gitps = spawnSync('git', ['rev-list', '-n', '1', tag], {
    encoding: 'utf-8',
    shell: process.platform === 'win32' ? 'powershell' : undefined,
  });
  console.log('stdout:', gitps.stdout);
  console.log('stderr:', gitps.stderr);
  const tagCommit = gitps.stdout.trim();

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
