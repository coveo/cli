import {ComponentSchema} from './schema';
import {join} from 'path';
import {validate} from 'jsonschema';
import {readFileSync, existsSync} from 'fs';

export function ensureNaming() {
  throw 'TODO:';
}

export function ensureRequiredProperties() {
  const jsonPkg = readFileSync(join(process.cwd(), 'package.json'));
  const parsed = JSON.parse(jsonPkg.toString());
  const validation = validate(parsed, ComponentSchema);
  if (!validation.valid) {
    throw validation.errors;
  }
}

// TODO: Checker naming

// TODO: Checker for scope (for internal users only)

export function ensureReadme() {
  const exists = existsSync(join(process.cwd(), 'readme.md'));
  if (!exists) {
    throw new Error('missing README file');
  }
}

export function ensureInternalScope() {
  // TODO: CDX-1266
}
