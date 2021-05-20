import {
  renameSync,
  existsSync,
  readFileSync,
  writeFileSync,
  truncateSync,
} from 'fs';
import {join} from 'path';
import {getProjectPath} from './cli';

export const deactivatedEnvFileName = '.env.disabled';
export const activeEnvFilename = '.env';

function swapEnv(projectName: string, frm: string, to: string) {
  const pathToEnv = getProjectPath(projectName);
  renameSync(join(pathToEnv, frm), join(pathToEnv, to));
}

export function deactivateEnvironmentFile(projectName: string) {
  swapEnv(projectName, activeEnvFilename, deactivatedEnvFileName);
}

export function restoreEnvironmentFile(projectName: string) {
  swapEnv(projectName, deactivatedEnvFileName, activeEnvFilename);
}

export function flushEnvFile(projectName: string) {
  const envPath = join(getProjectPath(projectName), '.env');
  const env = readFileSync(envPath, 'utf-8');
  truncateSync(envPath);
  return env;
}

export function overwriteEnvFile(projectName: string, data: string) {
  const envPath = join(getProjectPath(projectName), '.env');
  writeFileSync(envPath, data);
}

export function isEnvFileActive(projectName: string) {
  const projectPath = getProjectPath(projectName);
  return existsSync(join(projectPath, '.env'));
}

export function getPathToEnvFile(projectName: string) {
  const projectPath = getProjectPath(projectName);
  return isEnvFileActive(projectName)
    ? join(projectPath, activeEnvFilename)
    : join(projectPath, deactivatedEnvFileName);
}
