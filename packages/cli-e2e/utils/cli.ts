import type {ChildProcessWithoutNullStreams} from 'child_process';
import {resolve, join} from 'path';
import {mkdirSync} from 'fs';
import {homedir} from 'os';
import {ProcessManager} from './processManager';
import {readJsonSync} from 'fs-extra';
import {Terminal} from './terminal/terminal';
import {npmCachePathEnvVar} from './npm';

export const isGenericYesNoPrompt = /\(y\/n\)[\s:]*$/i;

export function answerPrompt(answer: string) {
  return (proc: ChildProcessWithoutNullStreams) =>
    new Promise<void>((resolve) => {
      if (!proc.stdin.write(answer)) {
        proc.stdin.once('drain', () => resolve());
      } else {
        process.nextTick(() => resolve());
      }
    });
}

export interface ISetupUIProjectOptionsArgs {
  flags?: string[];
  projectDir?: string;
}

export function getEnvFilePath() {
  return join('.env');
}

export function getUIProjectPath(): string {
  return process.env.UI_PROJECT_PATH!;
}

export function getProjectPath(
  projectName: string,
  uiProjectFolderName = getUIProjectPath()
) {
  mkdirSync(join(uiProjectFolderName), {recursive: true});
  return join(uiProjectFolderName, projectName);
}

export async function setupUIProject(
  processManager: ProcessManager,
  commandArgs: string,
  projectName: string,
  options: ISetupUIProjectOptionsArgs = {}
) {
  const versionToTest = process.env.UI_TEMPLATE_VERSION;
  let command = [commandArgs, projectName, ...(options.flags || [])];

  if (versionToTest) {
    command = command.concat(['-v', versionToTest]);
    console.log(`Testing with version ${versionToTest} of the template`);
  } else {
    console.log('Testing with published version of the template');
  }

  const args = [process.env.CLI_EXEC_PATH!, ...command];
  let parentDir = resolve(getProjectPath(projectName), '..');
  if (options.projectDir) {
    parentDir = resolve(options.projectDir, '..');
    mkdirSync(parentDir, {recursive: true});
    const gitInitTerminal = new Terminal(
      'git',
      ['init'],
      {
        cwd: parentDir,
      },
      processManager,
      `${projectName}-git-init`
    );

    await gitInitTerminal.when('exit').on('process').do().once();
  }

  if (process.platform === 'win32') {
    args.unshift('node');
  }

  const env: Record<string, any> = getCleanEnv();
  const buildProcess = new Terminal(
    args.shift()!,
    args,
    {
      cwd: parentDir,
      env,
    },
    processManager,
    `build-${projectName}`
  );
  return buildProcess;
}
export function getConfigFilePath() {
  const configsDir = process.platform === 'win32' ? 'AppData/Local' : '.config';
  return resolve(homedir(), configsDir, '@coveo', 'cli', 'config.json');
}

export function getConfig() {
  const pathToConfig = getConfigFilePath();

  return readJsonSync(pathToConfig);
}

export const registryEnv = process.env.E2E_USE_NPM_REGISTRY
  ? {}
  : {
      npm_config_registry: 'http://localhost:4873',
      YARN_NPM_REGISTRY_SERVER: 'http://localhost:4873',
    };

function getCleanEnv(): Record<string, any> {
  const env: Record<string, any> = {
    ...process.env,
    ...registryEnv,
    npm_config_cache: process.env[npmCachePathEnvVar],
  };
  const excludeEnvVars = [
    'npm_config_local_prefix',
    'npm_package_json',
    'INIT_CWD',
  ];
  const pathSep = process.platform === 'win32' ? ';' : ':';
  const pathName = process.platform === 'win32' ? 'Path' : 'PATH';
  const path = env[pathName].split(pathSep);
  const filteredPath = path.filter(
    (pathElement: string) => !isParent(env['GITHUB_WORKSPACE'], pathElement)
  );
  env[pathName] = filteredPath.join(pathSep);
  for (const excludeVar of excludeEnvVars) {
    delete env[excludeVar];
  }
  return env;
}

function isParent(parent: string, potentialChild: string) {
  return resolve(potentialChild).startsWith(resolve(parent));
}
