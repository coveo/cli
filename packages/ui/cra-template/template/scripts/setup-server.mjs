import {spawnSync} from 'child_process';
import {copySync} from 'fs-extra';
import {sep, resolve} from 'path';
import {getPackageManager} from './utils.mjs';

function installSearchTokenServerDependencies() {
  const child = spawnSync(getPackageManager(), ['install'], {
    stdio: 'inherit',
    cwd: resolve('server'),
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

function copySearchTokenServerToRoot() {
  copySync(
    resolve('node_modules', '@coveo', 'search-token-server'),
    resolve('server'),
    {
      filter: (src, dest) => !isNodeModule(dest) && !isEnvFile(dest),
    }
  );
}

function main() {
  copySearchTokenServerToRoot();
  installSearchTokenServerDependencies();
}

main();
