import {fork, ForkOptions, ChildProcess, spawnSync} from 'node:child_process';
import globalConfig from '../config/globalConfig';
import {join, resolve} from 'node:path';
import {existsSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import npa from 'npm-package-arg';
import {InternalError} from '../errors/internalError';
import {appendCmdIfWindows} from '../utils/os';
import {satisfies} from 'semver';

/**
 * {@see https://nodejs.org/api/errors.html#module_not_found}
 */
const NODE_ERR_MODULE_NOT_FOUND = 'MODULE_NOT_FOUND';

interface Pjson {
  version: string;
  main?: string;
  exports?: string;
}

/**
 * Node Package Fork: Do NPX, but with a `child_process.fork`.
 * @param packageSpec the package specifier, {@see https://docs.npmjs.com/cli/v9/using-npm/package-spec?v=true}
 * @param opts {NpfOptions} tweak some options for fork & npf
 * @returns {ChildProcess} the forked process.
 */
export default function (
  packageSpec: string,
  args: string[] = [],
  opts?: ForkOptions
): ChildProcess {
  if (!isPackageInstalled(packageSpec)) {
    installPackage(packageSpec);
  }
  const entrypoint = getEntrypointFromPackageSpec(packageSpec);
  return fork(entrypoint, args, opts);
}

function isPackageInstalled(packageSpec: string): boolean {
  const {name: packageName, saveSpec: packageVersion} = npa(packageSpec);
  if (!packageName) {
    throw new InternalError(`Package spec ${packageSpec} seems invalid`);
  }
  let packageJsonFromRequire = getPackageJsonFromLazyLoadDirectory(packageName);
  return packageVersion
    ? satisfies(packageJsonFromRequire?.version ?? '', packageVersion)
    : Boolean(packageJsonFromRequire);
}

function installPackage(packageSpec: string) {
  if (!existsSync(join(getLazyLoadedDependencyProjectPath()))) {
    ensureCliNodeModuleFolderExists();
    initializeNpmProject();
  }
  spawnSync(appendCmdIfWindows`npm`, ['install', '-E', packageSpec], {
    cwd: getLazyLoadedDependencyDirectoryPath(),
    shell: process.platform === 'win32' ? 'powershell' : undefined,
  });
}

function ensureCliNodeModuleFolderExists() {
  mkdirSync(getLazyLoadedDependencyDirectoryPath(), {
    recursive: true,
  });
}

function getLazyLoadedDependencyProjectPath(): string {
  return join(getLazyLoadedDependencyDirectoryPath(), 'package.json');
}

function getLazyLoadedDependencyDirectoryPath(): string {
  return resolve(globalConfig.get().dataDir, 'lazyLoadedDependencies');
}

function getPackageJsonFromLazyLoadDirectory(
  packageName: string
): Pjson | null | never {
  let packageJson = null;
  const packageJsonPath = join(packageName, 'package.json');
  try {
    packageJson = requireFromLazy()(packageJsonPath);
  } catch (error) {
    if (isErrorWithCode(error) && error.code !== NODE_ERR_MODULE_NOT_FOUND) {
      throw error;
    }
  }
  return packageJson;
}

function initializeNpmProject() {
  spawnSync(appendCmdIfWindows`npm`, ['init', '-y'], {
    cwd: getLazyLoadedDependencyDirectoryPath(),
    shell: process.platform === 'win32' ? 'powershell' : undefined,
  });
}

function getEntrypointFromPackageSpec(packageSpec: string): string {
  const {name: packageName} = npa(packageSpec);
  if (!packageName) {
    throw new InternalError(`Package spec ${packageSpec} seems invalid`);
  }
  try {
    return requireFromLazy().resolve(packageName);
  } catch (error) {
    if (isErrorWithCode(error) && error.code === NODE_ERR_MODULE_NOT_FOUND) {
      throw new InternalError(
        `Package ${packageName} does not have an entrypoint.`
      );
    } else {
      throw error;
    }
  }
}

function requireFromLazy() {
  return createRequire(getLazyLoadedDependencyProjectPath());
}

function isErrorWithCode(error: any): error is Error & {code: string} {
  return typeof error['code'] === 'string' && error instanceof Error;
}
