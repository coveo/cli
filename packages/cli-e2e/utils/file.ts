import {
  renameSync,
  existsSync,
  readFileSync,
  writeFileSync,
  truncateSync,
  appendFileSync,
  ensureFileSync,
  readdirSync,
} from 'fs-extra';
import {parse} from 'dotenv';
import {join} from 'path';
import {getProjectPath} from './cli';
import {EOL} from 'os';

const deactivatedEnvFileName = '.env.disabled';
const activeEnvFilename = '.env';

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

export function saveToEnvFile(
  pathToEnv: string,
  additionalEnvironment: Record<string, unknown>
) {
  ensureFileSync(pathToEnv);
  const environment = parse(readFileSync(pathToEnv, {encoding: 'utf-8'}));

  const updatedEnvironment = {
    ...environment,
    ...additionalEnvironment,
  };

  truncateSync(pathToEnv);
  for (const [key, value] of Object.entries(updatedEnvironment)) {
    appendFileSync(pathToEnv, `${key}=${value}${EOL}`);
  }
}

export function foldersContainSimilarFiles(folder1: string, folder2: string) {
  const folder1Files = readdirSync(folder1);
  const folder2Files = readdirSync(folder2);
  if (folder1Files.length !== folder2Files.length) {
    return false;
  }

  for (const file of folder1Files) {
    if (!existsSync(join(folder2, file))) {
      return false;
    }
  }

  return true;
}
