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
  const {elementName} = getJsonPkg(); // TODO: CDX-1389: Add a custom property to component's package.json in create-atomic-component packages
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
