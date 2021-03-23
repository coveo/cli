/* eslint-disable no-undef */
const {join, resolve} = require('path');
const {ensureDir, ensureSymlink} = require('fs-extra');

async function createSymlinks(packagesDir, symlinkDir, packagesToLink) {
  await ensureDir(symlinkDir);
  return Promise.all(
    packagesToLink.map(async (packageName) => {
      return ensureSymlink(
        join(packagesDir, packageName),
        join(symlinkDir, packageName)
      );
    })
  );
}

async function main() {
  const packagesToLink = [
    'cra-template',
    'angular',
    'vue-cli-plugin-typescript',
  ];
  const packagesDir = resolve(__dirname, '..', 'packages');
  const symlinkDir = resolve(
    __dirname,
    '..',
    'packages',
    'cli',
    'src',
    'templates'
  );
  await createSymlinks(packagesDir, symlinkDir, packagesToLink);
}

main();
