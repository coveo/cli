import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {Configuration} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {spawnProcess} from '../utils/process';
import {
  IsAuthenticated,
  AuthenticationType,
  HasNecessaryCoveoPrivileges,
} from '@coveo/cli-commons/preconditions/index';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
  listSearchHubsPrivilege,
  viewSearchPagesPrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {
  IsNpxInstalled,
  IsNodeVersionInRange,
} from '../decorators/preconditions';
import {getPackageVersion} from '../utils/misc';
import {promptForSearchHub} from '../ui/shared';
import {lt} from 'semver';

interface CreateAppOptions {
  initializerVersion?: string;
  pageId?: string;
  projectName: string;
  cfg: Configuration;
}
export const atomicAppInitializerPackage = '@coveo/create-atomic';
export const atomicLibInitializerPackage =
  '@coveo/create-atomic-component-project';

const supportedNodeVersions = '^18.18.1 || ^20.9.0 || ^22.0.0';

export const atomicLibPreconditions = [
  IsNodeVersionInRange(supportedNodeVersions),
];

export const atomicAppPreconditions = [
  IsAuthenticated([AuthenticationType.OAuth]),
  IsNpxInstalled(),
  IsNodeVersionInRange(supportedNodeVersions),
  HasNecessaryCoveoPrivileges(
    createApiKeyPrivilege,
    impersonatePrivilege,
    viewSearchPagesPrivilege,
    listSearchHubsPrivilege
  ),
];

/**
 * Checks if the current Node.js version requires the --experimental-detect-module flag.
 * Node versions < 20.19.0 have stricter ES module handling that requires this flag
 * when using Stencil with ES module packages.
 */
function shouldAddExperimentalDetectModuleFlag(): boolean {
  const nodeVersion = process.version;
  // Check if Node version is less than 20.19.0
  return lt(nodeVersion, '20.19.0');
}

// Command prefix to use for stencil when Node < 20.19.0
const STENCIL_COMMAND_PREFIX =
  'node --experimental-detect-module ./node_modules/.bin/stencil';

/**
 * Modifies the package.json scripts to add --experimental-detect-module flag
 * to the build and start commands for Node versions < 20.19.0.
 */
function patchPackageJsonScripts(projectPath: string): void {
  const packageJsonPath = join(projectPath, 'package.json');

  try {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    if (packageJson.scripts) {
      // Update the start script - only if it starts with 'stencil' command
      if (
        packageJson.scripts.start &&
        /^\s*stencil\b/.test(packageJson.scripts.start)
      ) {
        packageJson.scripts.start = packageJson.scripts.start.replace(
          /^\s*stencil/,
          STENCIL_COMMAND_PREFIX
        );
      }

      // Update the build script - only if it starts with 'stencil' command
      if (
        packageJson.scripts.build &&
        /^\s*stencil\b/.test(packageJson.scripts.build)
      ) {
        packageJson.scripts.build = packageJson.scripts.build.replace(
          /^\s*stencil/,
          STENCIL_COMMAND_PREFIX
        );
      }

      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n',
        'utf8'
      );
    }
  } catch (error) {
    // If we can't modify the package.json, we'll just log a warning but not fail
    // The user can manually add the flag if needed
    console.warn(
      `Warning: Could not modify package.json scripts for project '${projectPath}': ${error}. You may need to manually add '--experimental-detect-module' to your stencil commands.`
    );
  }
}

export async function createAtomicApp(options: CreateAppOptions) {
  const authenticatedClient = new AuthenticatedClient();
  const platformClient = await authenticatedClient.getClient();
  const searchHub = await promptForSearchHub(platformClient);
  const username = await authenticatedClient.getUsername();
  const cliArgs: string[] = [
    `${atomicAppInitializerPackage}@${
      options.initializerVersion ??
      getPackageVersion(atomicAppInitializerPackage)
    }`,
    '--project',
    options.projectName,
    '--org-id',
    options.cfg.organization,
    '--api-key',
    options.cfg.accessToken!,
    '--platform-url',
    platformUrl({
      environment: options.cfg.environment,
      region: options.cfg.region,
    }),
    '--platform-environment',
    options.cfg.environment,
    '--user',
    username,
    '--search-hub',
    searchHub,
  ];

  if (options.pageId) {
    cliArgs.push('--page-id', options.pageId);
  }

  const exitCode = await spawnProcess(appendCmdIfWindows`npx`, cliArgs);

  // If the project was created successfully and Node version < 20.19.0,
  // patch the package.json to add the --experimental-detect-module flag
  if (exitCode === 0 && shouldAddExperimentalDetectModuleFlag()) {
    const projectPath = resolve(options.projectName);
    patchPackageJsonScripts(projectPath);
  }

  return exitCode;
}

interface CreateLibOptions {
  projectName: string;
  initializerVersion?: string;
}

export async function createAtomicLib(options: CreateLibOptions) {
  const projectDirectory = resolve(options.projectName);

  mkdirSync(projectDirectory, {recursive: true});
  const initializer = `${atomicLibInitializerPackage}@${
    options.initializerVersion ?? getPackageVersion(atomicLibInitializerPackage)
  }`;

  return spawnProcess(appendCmdIfWindows`npx`, [initializer], {
    cwd: projectDirectory,
  });
}
