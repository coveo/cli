const {resolve} = require('path');
const {readFileSync, writeFileSync} = require('fs');
const {cwd} = require('process');

const packageJsonPath = resolve(cwd(), 'package.json');

const packageJSON = JSON.parse(readFileSync(packageJsonPath));
delete packageJSON.gitHead;
writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJSON, undefined, 2) + '\n'
);
