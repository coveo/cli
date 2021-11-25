const {spawnSync} = require('child_process');
const {copySync} = require('fs-extra');
const {sep, resolve} = require('path');
const {getPackageManager} = require('./utils');

function installSearchTokenLambdaDependencies() {
  const child = spawnSync(getPackageManager(), ['install'], {
    stdio: 'inherit',
    cwd: resolve('lambda'),
  });
  if (child.status !== 0) {
    process.exit(child.status);
  }
}

function isNodeModule(path) {
  return path.split(sep).indexOf('node_modules') !== -1;
}

function isEnvFile(path) {
  return path.split(sep).indexOf('.env.example') !== -1;
}

function copySearchTokenLambdaToRoot() {
  copySync(
    resolve('node_modules', '@coveo', 'search-token-lambda'),
    resolve('lambda'),
    {
      // TODO: filter more ?
      filter: (src, dest) => !isNodeModule(dest) && !isEnvFile(dest),
    }
  );
}

function main() {
  copySearchTokenLambdaToRoot();
  installSearchTokenLambdaDependencies();
}

main();
