import {CliUx} from '@oclif/core';
import {bold} from 'chalk';
import {Configuration} from '../../config/config';
import {SnapshotMissingVaultEntriesError} from '../../errors/snapshotErrors';
import {Snapshot} from '../snapshot';
import {SnapshotReporter} from '../snapshotReporter';
import {VaultHandler} from '../vaultHandler';

export {tryTransferFromOrganization} from './transferFromOrganization';

export type VaultTransferFunctionsParam = {
  reporter: SnapshotReporter;
  snapshot: Snapshot;
  cfg: Configuration;
  projectPath?: string;
};

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
