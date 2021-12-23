const {spawnSync} = require('child_process');
const {unlinkSync, readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const {getPackageManager} = require('./utils');
const pkgJson = JSON.parse(readFileSync('package.json'));

['prestart', 'setup-env', 'setup-server', 'setup-cleanup'].forEach(
  (script) => delete pkgJson['scripts'][script]
);

const pkgString = JSON.stringify(pkgJson, null, 2).replace(
  /npm/g,
  getPackageManager(true)
);

writeFileSync('package.json', pkgString);

['setup-server.js', 'setup-env.js', 'clean-up.js'].forEach((file) =>
  unlinkSync(join(__dirname, file))
);

spawnSync('git', ['add', '-A']);
spawnSync('git', ['commit', '-m', 'initialize coveo react search page'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
