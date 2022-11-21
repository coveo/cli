import {createRequire} from 'node:module';
import {join} from 'node:path';
import {valid} from 'semver';

export function getPackageVersion(packageName: string) {
  const require = createRequire(import.meta.url);
  const pathToPackageJson = join(...new Array(3).fill('..'), 'package.json');
  const pkg = require(pathToPackageJson);
  const dep =
    pkg.dependencies[packageName] ||
    pkg.devDependencies[packageName] ||
    pkg.peerDependencies[packageName];
  const defaultVersion = valid(dep?.toString())!;

  return defaultVersion;
}
