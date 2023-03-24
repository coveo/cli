import packageJsonSchema from './schema.js';
import {join} from 'node:path';
import {cwd} from 'process';
import {existsSync, readFileSync} from 'node:fs';

const componentDocPath = join(cwd(), 'docs', 'atomic-docs.json');

export function ensureRequiredProperties() {
  const parsed = getJsonPkg();
  packageJsonSchema.parse(parsed);
}

export function ensureReadme() {
  const exists = existsSync(join(cwd(), 'readme.md'));
  if (!exists) {
    throw new Error(
      'Missing README file. Make sure to include a `README.md` file in your component directory'
    );
  }
}

export function ensureDocFile() {
  // TODO: CDX-1388: make sure the atomic-docs.json creation is generated on build
  const exists = existsSync(componentDocPath);
  if (!exists) {
    throw new Error(
      `Missing ${componentDocPath} file. Make sure to run \`npm run build\` in your component directory`
    );
  }
}

export function ensureConsistentElementName() {
  throw 'TODO: CDX-1389';
}

export function ensureInternalScope() {
  // TODO: CDX-1266: Ensure internal components tags are tagged with the appropriate scope.
}

function getJsonPkg() {
  const jsonPkg = readFileSync(join(cwd(), 'package.json'));
  const parsed = JSON.parse(jsonPkg.toString());
  return parsed;
}
