import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {Configuration} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {appendCmdIfWindows} from '../utils/os';
import {spawnProcess} from '../utils/process';
import {
  IsAuthenticated,
  AuthenticationType,
  HasNecessaryCoveoPrivileges,
} from '@coveo/cli-commons/preconditions/index';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
  viewSearchPagesPrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {
  IsNpxInstalled,
  IsNodeVersionInRange,
} from '../decorators/preconditions';
import {getPackageVersion} from '../utils/misc';

interface CreateAppOptions {
  initializerVersion?: string;
  pageId?: string;
  projectName: string;
  cfg: Configuration;
}
export const atomicAppInitializerPackage = '@coveo/create-atomic';
export const atomicLibInitializerPackage =
  '@coveo/create-atomic-component-project';

const supportedNodeVersions = '16.x || 18.x';

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
    viewSearchPagesPrivilege
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
    '--user',
    username,
  ];

  if (options.pageId) {
    cliArgs.push('--page-id', options.pageId);
  }

  return spawnProcess(appendCmdIfWindows`npx`, cliArgs);
}

interface CreateLibOptions {
  projectName: string;
}

export function createAtomicLib(options: CreateLibOptions) {
  const projectDirectory = resolve(options.projectName);
  mkdirSync(projectDirectory);
  const cliArgs = ['init', atomicLibInitializerPackage];
  return spawnProcess(appendCmdIfWindows`npm`, cliArgs, {
    cwd: projectDirectory,
  });
}
