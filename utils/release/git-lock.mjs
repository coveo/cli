#!/usr/bin/env node

import {gitPull, getSHA1fromRef} from '@coveo/semantic-monorepo-tools';
import {dedent} from 'ts-dedent';

import {
  limitWriteAccessToBot,
  removeWriteAccessRestrictions,
} from './lock-master.mjs';

const isPrerelease = process.env.IS_PRERELEASE === 'true';
const noLockRequired = Boolean(process.env.NO_LOCK);

const ensureUpToDateBranch = async () => {
  // Lock-out master
  await limitWriteAccessToBot();

  // Verify master has not changed
  const local = await getSHA1fromRef('master');
  await gitPull();
  const remote = await getSHA1fromRef('master');
  if (local !== remote) {
    await removeWriteAccessRestrictions();
    throw new Error(dedent`
        master branch changed before lockout.
        pre-lock:${local}
        post-lock:${remote}
      `);
  }
};

if (!(isPrerelease || noLockRequired)) {
  await ensureUpToDateBranch();
}
