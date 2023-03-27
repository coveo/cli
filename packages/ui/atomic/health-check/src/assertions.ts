import packageJsonSchema from './schema.js';
import {join} from 'node:path';
import {cwd} from 'process';
import {existsSync, readFileSync} from 'node:fs';

const docRelativePath = join('docs', 'stencil-docs.json.json');
const componentDocPath = join(cwd(), docRelativePath);

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
  const exists = existsSync(componentDocPath);
  if (!exists) {
    throw new Error(
      `Missing ${docRelativePath} file in component directory. Try running \`npm run build\` first`
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
