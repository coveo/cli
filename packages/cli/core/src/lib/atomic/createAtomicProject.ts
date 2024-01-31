import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {Configuration} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {handleForkedProcess, spawnProcess} from '../utils/process';
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
import npf from '@coveo/cli-commons/npm/npf';
import {SubprocessError} from '../errors/subprocessError';
import {isErrorLike} from '../utils/errorSchemas';

interface CreateAppOptions {
  initializerVersion?: string;
  pageId?: string;
  projectName: string;
  cfg: Configuration;
  searchHub: string;
}
export const atomicAppInitializerPackage = '@coveo/create-atomic';
export const atomicLibInitializerPackage =
  '@coveo/create-atomic-component-project';

const supportedNodeVersions = '^18.18.1 || ^20.9.0';

const transformPackageNameToNpmInitializer = (packageName: string) =>
  packageName.replace('/create-', '/');

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

export async function createAtomicApp(options: CreateAppOptions) {
  const authenticatedClient = new AuthenticatedClient();

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
    options.searchHub,
  ];

  if (options.pageId) {
    cliArgs.push('--page-id', options.pageId);
  }

  return spawnProcess(appendCmdIfWindows`npx`, cliArgs);
}

interface CreateLibOptions {
  projectName: string;
}

export async function createAtomicLib(options: CreateLibOptions) {
  const projectDirectory = resolve(options.projectName);

  mkdirSync(projectDirectory, {recursive: true});
  const initializer = `${atomicLibInitializerPackage}@${getPackageVersion(
    atomicLibInitializerPackage
  )}`;

  const forkedProcess = npf(initializer, [], {
    stdio: 'inherit',
    cwd: projectDirectory,
  });
  try {
    await handleForkedProcess(forkedProcess);
  } catch (error) {
    if (isErrorLike(error))
      throw new SubprocessError(error.name, error.message);
  }
}
