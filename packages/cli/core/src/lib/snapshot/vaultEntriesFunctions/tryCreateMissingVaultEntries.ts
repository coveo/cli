import {formatOrgId} from '@coveo/cli-commons/utils/ux';
import {CliUx} from '@oclif/core';
import {bold} from 'chalk';
import {VaultHandler} from '../vaultHandler.js';
import {VaultTransferFunctionsParam} from './interfaces.js';

export async function tryCreateMissingVaultEntries({
  reporter,
  snapshot,
}: VaultTransferFunctionsParam) {
  const shouldCreate = await CliUx.ux.confirm(
    `\nWould you like to create the missing vault entries in the destination organization ${formatOrgId(
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
