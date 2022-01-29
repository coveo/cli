import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';

export default function (
  projectPath: string,
  from: string,
  to: string = 'HEAD'
) {
  const delimiter = `<--- ${randomBytes(64).toString('hex')} --->`;
  const gitParams = [
    'log',
    `--pretty=format:%B%n-hash-%n%H ${delimiter}`,
    '--dense',
    `${from}..${to}`,
    projectPath,
  ];
  const gitPs = spawnSync('git', gitParams, {encoding: 'ascii'});
  return gitPs.stdout
    .split(delimiter)
    .map((str) => str.trim())
    .filter((str) => Boolean(str));
}
