import dedent from 'ts-dedent';
import {Plurable, pluralizeIfNeeded} from '../utils/string';
import {
  PrintableError,
  SeverityLevel,
} from '@coveo/cli-commons/lib/errors/printableError';
import {CLIBaseError} from '@coveo/cli-commons/lib/errors/cliBaseError';

export class InvalidVaultEntryError extends PrintableError {
  public name = 'Invalid Vault Entries';
  public constructor(public organizationId: string, public vaultEntry: string) {
    super(SeverityLevel.Error);
    this.message = dedent`Cannot create vault entry ${vaultEntry} in your organization ${organizationId}.
    Visit https://docs.coveo.com/en/m3a90243 for more info on how to create vault entries.`;
  }
}

export class InvalidVaultFileError extends CLIBaseError {
  public name = 'Invalid vault file';
  public constructor(reason?: unknown) {
    super();
    if (reason) {
      this.message = `${reason}`;
    }
  }
}

abstract class MissingVaultEntryBaseError extends CLIBaseError {
  public abstract name: string;
  protected entryPlurable: Plurable = ['entry', 'entries'];
  public constructor(missingEntries: string[]) {
    super();
    this.message = '';
    for (const entry of missingEntries) {
      this.message += `\n  • ${entry}`;
    }
  }
}

export class MissingVaultEntryValueError extends MissingVaultEntryBaseError {
  public name = 'Missing vault entry value';
  public constructor(missingEntries: string[]) {
    super(missingEntries);

    this.message += `\n\nFill all required vault ${pluralizeIfNeeded(
      this.entryPlurable,
      missingEntries.length
    )} to proceed.`;
  }
}

export class SnapshotMissingVaultEntriesFromOriginError extends MissingVaultEntryBaseError {
  public name = 'Missing vault entries from origin organization';
  public constructor(
    originOrgId: string,
    targetId: string,
    missingVaultEntriesId: string[]
  ) {
    super(missingVaultEntriesId);
    this.message = dedent`Your origin organization is missing vault entries needed for the transfer to ${targetId}.
    Ensure that all the following vault entries are present on the organization ${originOrgId} (or your destination org, ${targetId}) and try again.
    Missing vault entries from both ${originOrgId} and ${targetId}:
    ${this.message}
    Visit https://docs.coveo.com/en/m3a90243 for more info on how to create vault entries.`;
  }
}
