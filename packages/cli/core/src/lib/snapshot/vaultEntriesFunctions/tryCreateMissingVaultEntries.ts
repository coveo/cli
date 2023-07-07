import {formatOrgId, confirm} from '@coveo/cli-commons/utils/ux';
import {bold} from 'chalk';
import {VaultHandler} from '../vaultHandler';
import {VaultTransferFunctionsParam} from './interfaces';

export async function tryCreateMissingVaultEntries({
  reporter,
  snapshot,
}: VaultTransferFunctionsParam) {
  const shouldCreate = await confirm(
    `\nWould you like to create the missing vault entries in the destination organization ${formatOrgId(
      snapshot.targetId
    )}? (y/n)`,
    false
  );
  if (!shouldCreate) {
    return false;
  }
  const vault = new VaultHandler(snapshot.targetId);
  await vault.createEntries(Array.from(reporter.missingVaultEntries));
  return true;
}
