import {dirname, resolve} from 'node:path';
import semver from 'semver';
import fsExtra from 'fs-extra';
import { fileURLToPath } from 'node:url';

const {readJsonSync} = fsExtra;
export function getPackageVersion(packageName: string) {
  const pathToPackageJson = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ...new Array(3).fill('..'),
    'package.json'
  );
  const pkg = readJsonSync(pathToPackageJson);
  const dep =
    pkg.dependencies[packageName] ||
    pkg.devDependencies[packageName] ||
    pkg.peerDependencies[packageName];
  const defaultVersion = semver.coerce(dep?.toString())?.version;

  return defaultVersion;
}
 