/**
 * Ensure all package-lock.json are using a lockVersion equal or greater than 2.
 */

const {readFileSync} = require('fs');
const {resolve} = require('path');

const lockFileVersionFinder = /(?<="lockfileVersion":\s)\d(?=,)/;

const lockFilePaths = process.argv[2].toString().split('\n');
let err = '';
for (const lockFilePath of lockFilePaths) {
  console.log(lockFilePath);
  const lockFileText = readFileSync(resolve(lockFilePath)).toString();
  // Package-lock.json are bulky and the info we need is right at the top of the file, so regex-match to go fast.
  if (lockFileText.match(lockFileVersionFinder)[0] < 2) {
    err += `${lockFilePath} needs to use a lockFileVersion greater than 1`;
  }
}

if (err) {
  throw err;
}
