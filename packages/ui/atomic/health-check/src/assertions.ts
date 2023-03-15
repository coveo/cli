import packageJsonSchema from './schema';
import {join} from 'path';
import {readFileSync, existsSync} from 'fs';
import {cwd} from 'process';

export function ensureRequiredProperties() {
  const jsonPkg = readFileSync(join(cwd(), 'package.json'));
  const parsed = JSON.parse(jsonPkg.toString());
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

export function ensureInternalScope() {
  // TODO: CDX-1266: Ensure internal components tags are tagged with the appropriate scope.
}
