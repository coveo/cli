import {VaultFetchStrategy, VaultEntryModel} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import {bold} from 'chalk';
import dedent from 'ts-dedent';
import {SnapshotMissingVaultEntriesFromOriginError} from '../../errors/vaultErrors';
import {AuthenticatedClient} from '../../platform/authenticatedClient';
import {Project} from '../../project/project';
import type {VaultEntryAttributes} from '../snapshotReporter';
import type {VaultTransferFunctionsParam} from './interfaces';

export async function tryTransferFromOrganization({
  reporter,
  snapshot,
  projectPath,
}: VaultTransferFunctionsParam) {
  if (!projectPath) {
    return false;
  }

  const originOrgId = new Project(projectPath).getResourceManifest()?.orgId;
  if (!originOrgId) {
    return false;
  }

  const shouldTransfer = await CliUx.ux.confirm(
    `\nWould you like to try transfering the vault entries from ${originOrgId} to the destination organization ${bold.cyan(
      snapshot.targetId
    )}? (y/n)`
  );
  if (!shouldTransfer) {
    return false;
  }
  const authenticatedClient = new AuthenticatedClient();
  if (!(await authenticatedClient.getUserHasAccessToOrg(originOrgId))) {
    CliUx.ux.warn(dedent`
        We mapped this snapshot to ${originOrgId}.
        If you want to do transfers the vault entries from ${originOrgId} and ${snapshot.targetId},
        authenticate with an account that has access to both and then try again.
      `);
    return false;
  }

  const originOrgVaultEntries = await getAllVaultEntriesFrom(originOrgId);
  const missingEntriesFromOrigin = getEntriesMissingFromOrigin(
    originOrgVaultEntries,
    reporter.missingVaultEntries
  );

  if (missingEntriesFromOrigin.length > 0) {
    CliUx.ux.warn(
      new SnapshotMissingVaultEntriesFromOriginError(
        originOrgId,
        snapshot.targetId,
        missingEntriesFromOrigin
      )
    );
    return false;
  }
  const platformClient = await authenticatedClient.getClient();

  try {
    platformClient.vault.import(
      snapshot.id,
      snapshot.targetId,
      originOrgId,
      VaultFetchStrategy.onlyMissing
    );
    return true;
  } catch (error) {
    CliUx.ux.warn('Error encountered while transfering vault entries`');
    CliUx.ux.warn(error as string | Error);
    return false;
  }
}

async function getAllVaultEntriesFrom(orgId: string) {
  const client = await new AuthenticatedClient().getClient({
    organization: orgId,
  });
  const vaultEntries: string[] = [];

  let totalPage = 0;
  for (let currentPage = 0; currentPage <= totalPage; currentPage++) {
    let result = await client.vault.list({page: currentPage});
    if (currentPage === 0) {
      totalPage = result.totalPages;
    }
    vaultEntries.concat(extractVaultEntryKeyFromResult(result.items));
  }
  return vaultEntries;
}

const extractVaultEntryKeyFromResult = (
  vaultEntries: VaultEntryModel[]
): string[] =>
  vaultEntries.flatMap((vaultEntry) => {
    const value = vaultEntry.key;
    return value ? [value] : [];
  });

function getEntriesMissingFromOrigin(
  originOrgVaultEntries: string[],
  missingVaultEntriesFromDestination: IterableIterator<VaultEntryAttributes>
) {
  let missingEntriesFromOrigin = [];
  for (const {vaultEntryId} of missingVaultEntriesFromDestination) {
    if (originOrgVaultEntries.includes(vaultEntryId)) {
      continue;
    } else {
      missingEntriesFromOrigin.push(vaultEntryId);
    }
  }
  return missingEntriesFromOrigin;
}
