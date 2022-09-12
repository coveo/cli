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
import {EOL} from 'os';

const deactivatedEnvFileName = '.env.disabled';
const activeEnvFilename = '.env';

function swapEnv(projectPath: string, frm: string, to: string) {
  renameSync(join(projectPath, frm), join(projectPath, to));
}

export function deactivateEnvironmentFile(projectPath: string) {
  swapEnv(projectPath, activeEnvFilename, deactivatedEnvFileName);
}

export function restoreEnvironmentFile(projectPath: string) {
  swapEnv(projectPath, deactivatedEnvFileName, activeEnvFilename);
}

export function flushEnvFile(projectPath: string) {
  const envPath = join(projectPath, '.env');
  const env = readFileSync(envPath, 'utf-8');
  truncateSync(envPath);
  return env;
}

export function overwriteEnvFile(projectPath: string, data: string) {
  const envPath = join(projectPath, '.env');
  writeFileSync(envPath, data);
}

function isEnvFileActive(projectPath: string) {
  return existsSync(join(projectPath, '.env'));
}

export function getPathToEnvFile(projectPath: string) {
  return isEnvFileActive(projectPath)
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
