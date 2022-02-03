import {spawnSync} from 'node:child_process';
import {appendCmdIfWindows} from './utils/appendCmdIfWindows';
export default function (newVersion: string, PATH: string) {
  spawnSync(
    appendCmdIfWindows`npm`,
    ['version', newVersion, '--git-tag-version=false'],
    {
      cwd: PATH,
    }
  );
}
