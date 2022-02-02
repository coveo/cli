import {spawnSync} from 'node:child_process';

export default function (tag: string) {
  spawnSync(`git`, ['tag', tag]);
}
