import {spawnSync} from 'node:child_process';
import {appendCmdIfWindows} from './utils/appendCmdIfWindows';

export default function (PATH: string) {
  spawnSync(appendCmdIfWindows`npm`, ['publish'], {cwd: PATH});
}
