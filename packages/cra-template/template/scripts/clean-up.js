const {unlinkSync, readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const {getPackageManager} = require('./utils');
const pkgJson = JSON.parse(readFileSync('package.json'));

[
  'prestart',
  'setup-env',
  'setup-server',
  'setup-cleanup',
  'commit-server',
].forEach((script) => delete pkgJson['scripts'][script]);

const pkgString = JSON.stringify(pkgJson, null, 2).replace(
  /npm/g,
  getPackageManager(true)
);

writeFileSync('package.json', pkgString);

['setup-server.js', 'setup-env.js', 'clean-up.js'].forEach((file) =>
  unlinkSync(join(__dirname, file))
);
