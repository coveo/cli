import type {ChildProcessWithoutNullStreams} from 'child_process';
import {resolve, join} from 'path';
import {mkdirSync} from 'fs';
import {homedir} from 'os';
import {ProcessManager} from './processManager';
import {readJsonSync} from 'fs-extra';
import {Terminal} from './terminal/terminal';

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

  const args = [CLI_EXEC_PATH, ...command];
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

  const env: Record<string, any> = {
    ...process.env,
    npm_config_registry: 'http://localhost:4873',
    YARN_NPM_REGISTRY_SERVER: 'http://localhost:4873',
  };
  const excludeEnvVars = [
    'npm_config_local_prefix',
    'npm_package_json',
    'INIT_CWD',
  ];

  for (const excludeVar of excludeEnvVars) {
    delete env[excludeVar];
  }
  const cmd = args.join(' ');
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
  buildProcess.orchestrator.process.stdout.emit('data', `${cmd}\n`);
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

export const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
