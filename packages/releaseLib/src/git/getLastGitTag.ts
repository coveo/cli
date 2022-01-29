import {spawnSync} from 'node:child_process';

/**
 * Return the tag of the last release
 * @param prefix only consider tag that has this prefix. Will return the last tag of the current branch by default.
 */
export default function (prefix?: string) {
  const gitParams = ['describe', '--tags', '--abbrev=0'];
  if (prefix) {
    gitParams.push(`--match=${prefix}*`);
  }
  const gitPs = spawnSync('git', gitParams, {encoding: 'utf-8'});
  return gitPs.stdout.trim();
}
