#!/usr/bin/env node

import {
  gitPull,
  getSHA1fromRef,
  gitSetupSshRemote,
  gitSetupUser,
} from '@coveo/semantic-monorepo-tools';
import {dedent} from 'ts-dedent';

import {
  limitWriteAccessToBot,
  removeWriteAccessRestrictions,
} from './lock-master.mjs';

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

const setupGit = async () => {
  const GIT_USERNAME = 'developer-experience-bot[bot]';
  const GIT_EMAIL =
    '91079284+developer-experience-bot[bot]@users.noreply.github.com';
  const DEPLOY_KEY = process.env.DEPLOY_KEY;
  if (DEPLOY_KEY === undefined) {
    throw new Error('Deploy key is undefined');
  }

  await gitSetupUser(GIT_USERNAME, GIT_EMAIL);
  await gitSetupSshRemote(REPO_OWNER, REPO_NAME, DEPLOY_KEY, GIT_SSH_REMOTE);
};

if (!(isPrerelease || noLockRequired)) {
  await setupGit();
  await ensureUpToDateBranch();
}
