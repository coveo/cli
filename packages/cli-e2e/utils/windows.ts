import {spawnSync} from 'child_process';
import {EOL} from 'os';
import {dirname, join} from 'path';

export const npm = () => {
  if (process.platform === 'win32') {
    const npmJsPath = require.resolve('npm');
    return ['node', npmJsPath];
  } else {
    return ['npm'];
  }
};
