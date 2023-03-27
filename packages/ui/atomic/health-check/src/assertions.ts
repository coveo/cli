import packageJsonSchema from './schema.js';
import {join} from 'node:path';
import {cwd} from 'process';
import {existsSync, readFileSync} from 'node:fs';

const docRelativePath = join('docs', 'stencil-docs.json');
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
  ensureDocFile();
  const {elementName} = getJsonPkg();
  const {components} = JSON.parse(readFileSync(componentDocPath).toString());
  const match = (components as Record<string, unknown>[]).some(
    ({tag}) => tag === elementName
  );
  if (!match) {
    throw new Error(
      `Component tag name from your .tsx file does not match the \`elementName\` property defined in your component's package.json file. Make sure both values are identical`
    );
  }
}

export function ensureInternalScope() {
  // TODO: CDX-1266: Ensure internal components tags are tagged with the appropriate scope.
}

function getJsonPkg() {
  const jsonPkg = readFileSync(join(cwd(), 'package.json'));
  const parsed = JSON.parse(jsonPkg.toString());
  return parsed;
}
