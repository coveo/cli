const {accessSync, constants} = require('fs');
const {resolve, join} = require('path');
const {setupSearchTokenServer} = require('./setup-server');

function main() {
  accessSync(
    resolve(join(process.cwd(), 'server', 'package.json')),
    constants.F_OK,
    () => {
      setupSearchTokenServer();
    }
  );
}

main();
