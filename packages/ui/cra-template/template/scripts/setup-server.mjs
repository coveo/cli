import {spawnSync} from 'node:child_process';
import {cpSync} from 'node:fs';
import {sep, resolve} from 'node:path';
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
  cpSync(
    resolve('node_modules', '@coveo', 'search-token-server'),
    resolve('server'),
    {
      filter: (src, dest) => !isNodeModule(dest) && !isEnvFile(dest),
      recursive: true,
    }
  );
}

function main() {
  copySearchTokenServerToRoot();
  installSearchTokenServerDependencies();
}

main();
