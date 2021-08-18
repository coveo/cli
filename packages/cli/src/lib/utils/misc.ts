import {resolve} from 'path';
import {coerce} from 'semver';

export function getPackageVersion(packageName: string) {
  const pathToPackageJson = resolve(
    __dirname,
    ...new Array(3).fill('..'),
    'package.json'
  );
  const pkg = require(pathToPackageJson);
  const dep =
    pkg.dependencies[packageName] ||
    pkg.devDependencies[packageName] ||
    pkg.peerDependencies[packageName];
  const defaultVersion = coerce(dep.toString())?.version;

  return defaultVersion;
}
