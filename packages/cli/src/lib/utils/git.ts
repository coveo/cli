import {spawnProcess, spawnProcessOutput} from './process';
import {cli} from 'cli-ux';

async function isInGitRepository(cwd: string) {
  const isGitProcess = await spawnProcessOutput(
    'git',
    ['rev-parse', '--is-inside-work-tree'],
    {
      cwd,
    }
  );
  return isGitProcess.stdout.includes('true');
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
