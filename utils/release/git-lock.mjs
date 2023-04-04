#!/usr/bin/env node

import {
  gitPull,
  getSHA1fromRef,
  gitCommit,
  gitPush,
  gitAdd,
  gitSetupSshRemote,
} from '@coveo/semantic-monorepo-tools';
import {dedent} from 'ts-dedent';

import {
  limitWriteAccessToBot,
  removeWriteAccessRestrictions,
} from './lock-master.mjs';
import {writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const isPrerelease = process.env.IS_PRERELEASE === 'true';
const noLockRequired = Boolean(process.env.NO_LOCK);
const PATH = '.';
const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';
const GIT_SSH_REMOTE = 'deploy';

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

/**
 * This will make .github\workflows\git-lock-fail.yml run and thus fail the associated check.
 */
const lockBranch = async () => {
  const DEPLOY_KEY = process.env.DEPLOY_KEY;
  if (DEPLOY_KEY === undefined) {
    throw new Error('Deploy key is undefined');
  }
  await gitSetupSshRemote(REPO_OWNER, REPO_NAME, DEPLOY_KEY, GIT_SSH_REMOTE);
  writeFileSync('.git-lock', '');
  await gitAdd('.git-lock');
  await gitCommit('lock master', PATH);
  await gitPush(GIT_SSH_REMOTE);
  spawnSync('git', ['reset', '--hard', 'HEAD~1']);
};

if (!(isPrerelease || noLockRequired)) {
  await ensureUpToDateBranch();
  await lockBranch();
}
