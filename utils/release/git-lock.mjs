import {gitPull, getSHA1fromRef} from '@coveo/semantic-monorepo-tools';
import dedent from 'ts-dedent';

import {changeMasterWriteAccess} from './lock-master.mjs';

const isPrerelease = process.env.IS_PRERELEASE === 'true';
const noLockRequired = Boolean(process.env.NO_LOCK);

const ensureUpToDateBranch = async () => {
  if (isPrerelease || noLockRequired) {
    return;
  }
  // Lock-out master
  await changeMasterWriteAccess(false);

  // Verify master has not changed
  const local = await getSHA1fromRef('master');
  await gitPull();
  const remote = await getSHA1fromRef('master');
  if (local !== remote) {
    await changeMasterWriteAccess(true);
    throw new Error(dedent`
        master branch changed before lockout.
        pre-lock:${local}
        post-lock:${remote}
      `);
  }
};

await ensureUpToDateBranch();
