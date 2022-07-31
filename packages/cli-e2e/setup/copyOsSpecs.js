const {readdirSync, copyFileSync} = require('node:fs');
const {join} = require('node:path');

function setupOsSpecificTests() {
  const testOsSpecificIdentifier = '.specs.os.';
  const testDir = join(__dirname, '..', '__tests__');
  const tests = readdirSync(testDir, {withFileTypes: true});
  for (const test of tests) {
    if (test.isFile() && test.name.includes(testOsSpecificIdentifier)) {
      for (const os of ['windows', 'linux']) {
        copyFileSync(
          join(testDir, test.name),
          join(
            testDir,
            test.name.replace(testOsSpecificIdentifier, `.specs.${os}.`)
          )
        );
      }
    }
  }
}

setupOsSpecificTests();
