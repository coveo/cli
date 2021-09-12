const {unlinkSync, readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const {getPackageManager} = require('./utils');
const pkgJson = JSON.parse(readFileSync('package.json'));

['postinstall', 'setup-env', 'setup-server', 'setup-cleanup'].forEach(
  (script) => delete pkgJson['scripts'][script]
);

const pkgString = JSON.stringify(pkgJson).replace(
  /npm/g,
  getPackageManager(true)
);

writeFileSync('package.json', pkgString);

['setup-server.js', 'setup-env.js', 'clean-up.js'].forEach((file) =>
  unlinkSync(join(__dirname, file))
);
