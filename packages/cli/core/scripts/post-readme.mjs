import {readFileSync, writeFileSync} from 'fs';
const readmMePath = 'README.md';
const readme = readFileSync(readmMePath, {encoding: 'utf-8'}).replaceAll(
  'https://github.com/coveo/cli/blob/v',
  'https://github.com/coveo/cli/blob/@coveo/cli@'
);

writeFileSync(readmMePath, readme);
