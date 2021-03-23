/* eslint-disable no-undef */
const {join, resolve} = require('path');
const {emptydirSync, removeSync} = require('fs-extra');
const packlist = require('npm-packlist');
const tar = require('tar');
const {spawnSync} = require('child_process');

async function cleanTemplates(destDir) {
  emptydirSync(destDir);
}

function packPackage(srcDir, destDir, packageName) {
  const packageDir = join(srcDir, packageName);
  const packageTarball = join(destDir, `${packageName}.tgz`);

  return packlist({path: packageDir}).then((files) =>
    // TODO: do not create tar ball. JUST cp files
    tar.create(
      {
        prefix: packageName,
        cwd: packageDir,
        file: packageTarball,
        gzip: true,
      },
      files
    )
  );
}

async function unpackAndInstall(destDir, packageName) {
  const packageTarball = join(destDir, `${packageName}.tgz`);
  await tar.extract({file: packageTarball, cwd: destDir});
  // TODO: maybe install schematic's node_module only when the user uses the command for the first time.
  spawnSync('npm', ['install', '--production', '--no-package-lock'], {
    cwd: join(destDir, packageName),
    stdio: 'inherit',
  });

  removeSync(packageTarball);
}

async function bundlePackages(srcDir, destDir, packagesToCopy) {
  await Promise.all(
    packagesToCopy.map((packageName) => {
      return packPackage(srcDir, destDir, packageName);
    })
  );

  await Promise.all(
    packagesToCopy.map((packageName) => {
      return unpackAndInstall(destDir, packageName);
    })
  );
}

async function main() {
  const packagesToCopy = [
    'cra-template',
    'angular',
    'vue-cli-plugin-typescript',
  ];
  const srcDir = resolve(__dirname, '..', '..');
  const destDir = resolve(__dirname, '..', 'lib', 'templates');
  cleanTemplates(destDir);
  await bundlePackages(srcDir, destDir, packagesToCopy);
}

main();
