import {spawnSync} from 'child_process';
import {EOL} from 'os';
import {dirname, join} from 'path';

export const npm = () => {
  if (process.platform !== 'win32') {
    const npmJsPath = join(
      dirname(
        spawnSync('where.exe', ['npm'], {encoding: 'utf-8'}).stdout.split(
          EOL
        )[0]
      ),
      'node_modules',
      'npm',
      'bin',
      'npm-cli.js'
    );
    return ['node', npmJsPath];
  } else {
    return 'npm';
  }
};
