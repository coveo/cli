const {unlinkSync, readFileSync, writeFileSync} = require('fs');

const pkgJson = JSON.parse(readFileSync('package.json'));
['postinstall', 'setup-env', 'setup-server'].forEach(
  (script) => delete pkgJson['scripts'][script]
);
writeFileSync('package.json', JSON.stringify(pkgJson));

['setup-server.js', 'setup-env.js', 'clean-up.js'].forEach((file) =>
  unlinkSync(file)
);
