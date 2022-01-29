import {npmPublish} from '@coveo/semantic-monorepo-tools';
import {spawnSync} from 'node:child_process';
// Get all commits since last release bump the root package.json version.
(async () => {
  const PATH = '.';
  spawnSync('npm', ['publish', '--dry-run'], {cwd: PATH});
})();
