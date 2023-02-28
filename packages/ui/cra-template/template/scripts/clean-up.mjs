import {spawnSync} from 'node:child_process';
import {unlinkSync, readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getPackageManager} from './utils.mjs';
const pkgJson = JSON.parse(readFileSync('package.json'));
const __dirname = dirname(fileURLToPath(import.meta.url));

['prestart', 'setup-env', 'setup-server', 'setup-cleanup'].forEach(
  (script) => delete pkgJson['scripts'][script]
);

const pkgString = JSON.stringify(pkgJson, null, 2).replace(
  /npm/g,
  getPackageManager(true)
);

writeFileSync('package.json', pkgString);

['setup-server.mjs', 'setup-env.mjs', 'clean-up.mjs'].forEach((file) =>
  unlinkSync(join(__dirname, file))
);

spawnSync('git', ['add', '-A']);
spawnSync('git', ['commit', '-m', 'initialize coveo react search page'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
