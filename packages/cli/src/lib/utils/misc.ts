import {resolve} from 'path';
import semver from 'semver';
import fsExtra from 'fs-extra';
const {readJsonSync} = fsExtra;
export function getPackageVersion(packageName: string) {
  const pathToPackageJson = resolve(
    import.meta.url,
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
 