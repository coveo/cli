import {renameSync} from 'node:fs';
import {join} from 'path';
import {getProjectPath} from './cli';

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
