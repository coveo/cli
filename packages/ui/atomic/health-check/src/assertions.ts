import packageJsonSchema from './schema.js';
import {join, basename} from 'node:path';
import {cwd} from 'process';
import {existsSync, readFileSync} from 'node:fs';

const docRelativePath = join('docs', 'atomic-docs.json');
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
  const {elementName} = getJsonPkg();
  const jsonDocs = JSON.parse(readFileSync(componentDocPath).toString());
  const {components, filePath} = jsonDocs;
  const match = [...components].some(({tag}) => {
    tag === elementName;
  });
  if (!match) {
    throw new Error(
      `Component tag name in ${filePath} does not match the \`elementName\` property defined in your component's package.json file. Make sure both values are identical.`
    );
  }
  ensureComponentNameStandard(elementName);
}

export function ensureInternalScope() {
  // TODO: CDX-1266: Ensure internal components tags are tagged with the appropriate scope.
}

function ensureComponentNameStandard(_name: string) {
  // TODO: CDX-1366: check if the component name uses redundant words (atomic, coveo, ...)
  // TODO: CDX-1390: check if the component name matches the PotentialCustomElementName production as defined in the HTML Standard.
}

function getJsonPkg() {
  const jsonPkg = readFileSync(join(cwd(), 'package.json'));
  const parsed = JSON.parse(jsonPkg.toString());
  return parsed;
}
