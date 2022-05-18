import {CliUx} from '@oclif/core';
import {bold} from 'chalk';
import {SnapshotMissingVaultEntriesError} from '../../errors/snapshotErrors';
import {VaultHandler} from '../vaultHandler';
import {VaultTransferFunctionsParam} from './interfaces';

export * from './interfaces';
export * from './transferFromOrganization';

export async function tryCreateMissingVaultEntries({
  reporter,
  snapshot,
}: VaultTransferFunctionsParam) {
  const shouldCreate = await CliUx.ux.confirm(
    `\nWould you like to create the missing vault entries in the destination organization ${bold.cyan(
      snapshot.targetId
    )}? (y/n)`
  );
  if (!shouldCreate) {
    return false;
  }
  const vault = new VaultHandler(snapshot.targetId);
  await vault.createEntries(Array.from(reporter.missingVaultEntries));
  return true;
}

export function throwSnapshotMissingVaultEntriesError({
  snapshot,
  cfg,
  projectPath,
}: VaultTransferFunctionsParam): never {
  throw new SnapshotMissingVaultEntriesError(snapshot, cfg, projectPath);
}
