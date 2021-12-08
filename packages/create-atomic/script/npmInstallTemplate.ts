import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {cwd} from 'node:process';
import {getPackageManager} from '../src/utils.js';

(async () =>
  await new Promise((resolve, reject) => {
    const childProcess = spawn(
      'npm',
      [process.env.CI ? 'ci' : 'install', '--ignore-scripts'],
      {
        stdio: 'inherit',
        cwd: join(cwd(), 'templates'),
      }
    );

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve('Packages installed correctly');
      } else {
        reject(`npm install exited with ${code}`);
      }
    });
  }))();
