import {VaultFetchStrategy, VaultEntryModel} from '@coveo/platform-client';
import {ux as cli} from '@oclif/core';
import {bold} from 'chalk';
import {
  formatOrgId,
  startSpinner,
  stopSpinner,
} from '@coveo/cli-commons/utils/ux';
import dedent from 'ts-dedent';
import {SnapshotMissingVaultEntriesFromOriginError} from '../../errors/vaultErrors';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
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

  const shouldTransfer = await cli.confirm(
    `\nWould you like to try transferring the vault entries from ${formatOrgId(
      originOrgId
    )} to the destination organization ${formatOrgId(snapshot.targetId)}? (y/n)`
  );
  if (!shouldTransfer) {
    return false;
  }

  const authenticatedClient = new AuthenticatedClient();
  if (!(await authenticatedClient.getUserHasAccessToOrg(originOrgId))) {
    cli.warn(dedent`
        We mapped this snapshot to ${formatOrgId(originOrgId)}.
        If you want to transfer the vault entries from ${formatOrgId(
          originOrgId
        )} to ${formatOrgId(snapshot.targetId)},
        authenticate with an account that has access to both organizations and then try again.
      `);
    return false;
  }

  const originOrgVaultEntries = await getAllVaultEntriesFrom(originOrgId);
  const missingEntriesFromOrigin = getEntriesMissingFromOrigin(
    originOrgVaultEntries,
    reporter.missingVaultEntries
  );

  if (missingEntriesFromOrigin.length > 0) {
    cli.warn(
      new SnapshotMissingVaultEntriesFromOriginError(
        originOrgId,
        snapshot.targetId,
        missingEntriesFromOrigin
      )
    );
    return false;
  }

  const platformClient = await authenticatedClient.getClient({
    organization: snapshot.targetId,
  });

  try {
    startSpinner('transferring vault entries');
    await platformClient.vault.import(
      snapshot.id,
      originOrgId,
      VaultFetchStrategy.onlyMissing
    );
    stopSpinner();
    return true;
  } catch (error) {
    stopSpinner({success: false});
    cli.warn('Error encountered while transferring vault entries`');
    cli.warn(typeof error === 'string' ? error : JSON.stringify(error));
    return false;
  }
}

async function getAllVaultEntriesFrom(orgId: string) {
  const client = await new AuthenticatedClient().getClient({
    organization: orgId,
  });
  const vaultEntries: string[] = [];

  let totalPages = 0;
  let currentPage = 0;
  do {
    let result = await client.vault.list({page: currentPage, perPage: 1});
    if (currentPage === 0) {
      totalPages = result.totalPages;
    }
    vaultEntries.push(...extractVaultEntryKeyFromResult(result.items));
    currentPage++;
  } while (currentPage < totalPages);
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
    if (!originOrgVaultEntries.includes(vaultEntryId)) {
      missingEntriesFromOrigin.push(vaultEntryId);
    }
  }
  return missingEntriesFromOrigin;
}
