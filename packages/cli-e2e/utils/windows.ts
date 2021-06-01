import {spawnSync} from 'child_process';
import {dirname, join} from 'path';

export const npmJsPath = () =>
  join(
    dirname(
      spawnSync('where.exe', ['npm'], {encoding: 'utf-8'}).stdout.split(EOL)[0]
    ),
    'node_modules',
    'npm',
    'bin',
    'npm-cli.js'
  );
