// Update the template.json dependencies based on what's in the package.json

import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {readFileSync, writeFileSync} from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToTemplate = join(__dirname, '..', 'template.json');
const pathToPackage = join(__dirname, '..', 'package.json');

const template = readFileSync(pathToTemplate, 'utf-8');
const templateJSON = JSON.parse(template);
const packageJSON = JSON.parse(readFileSync(pathToPackage, 'utf-8'));
for (const depType of ['dependencies', 'devDependencies']) {
  for (const dep of Object.keys(templateJSON['package'][depType])) {
    if (!packageJSON['devDependencies'][dep]) {
      throw new Error(
        `Package used in template.json not defined in package.json: ${dep}`
      );
    }
    templateJSON['package'][depType][dep] = packageJSON['devDependencies'][dep];
  }
}

writeFileSync(pathToTemplate, JSON.stringify(templateJSON));
