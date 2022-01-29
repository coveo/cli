import {spawnSync} from 'node:child_process';

export default function (newVersion: string, prefix: string) {
  spawnSync(`git`, ['tag', `${prefix}${newVersion}`]);
}
