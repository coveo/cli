import {Configuration} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {appendCmdIfWindows} from '../utils/os';
import {spawnProcess} from '../utils/process';

interface CreateProjectOptions {
  initializerVersion: string;
  pageId?: string;
  projectName: string;
  cfg: Configuration;
}
export const atomicInitializerPackage = '@coveo/create-atomic';

export async function createAtomicApp(options: CreateProjectOptions) {
  const authenticatedClient = new AuthenticatedClient();

  const username = await authenticatedClient.getUsername();
  const cliArgs: string[] = [
    `${atomicInitializerPackage}@${options.initializerVersion}`,
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
