import {spawnProcess} from './process';
import {cli} from 'cli-ux';

async function isInGitRepository(cwd: string) {
  try {
    await spawnProcess('git', ['rev-parse', '--is-inside-work-tree'], {
      stdio: 'ignore',
      cwd,
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function tryGitCommit(
  cwd: string,
  message = 'commit from the CLI'
) {
  if (await isInGitRepository(cwd)) {
    try {
      await spawnProcess('git', ['add', '-A'], {
        stdio: 'ignore',
        cwd,
      });
      await spawnProcess('git', ['commit', '-m', message], {
        stdio: 'ignore',
        cwd,
      });
    } catch (error) {
      cli.warn('Git commit not created');
      cli.warn(error);
    }
  }
}
