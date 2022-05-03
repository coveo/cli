import dedent from 'ts-dedent';
import {yellow} from 'chalk';
import {Plurable, pluralizeIfNeeded} from '../utils/string';
import {PrintableError, SeverityLevel} from './printableError';
import {CLIBaseError} from './CLIBaseError';

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
  public constructor(filePath: string, reason?: unknown) {
    super();
    this.message = dedent`Invalid vault file ${filePath}`;
    if (reason) {
      this.message += `
      ${reason}`;
    }
  }
}

export class MissingVaultEntryValueError extends CLIBaseError {
  public name = 'Missing vault entry value';
  private entryPlurable: Plurable = ['entry', 'entries'];
  public constructor(missingEntries: string[]) {
    super();
    this.message = dedent`Missing value for vault ${pluralizeIfNeeded(
      this.entryPlurable,
      missingEntries.length
    )}.`;

    for (const entry of missingEntries) {
      this.message += yellow(`\n  • ${entry}`);
    }

    this.message += '\n\nFill all required vault entries to proceed.';
  }
}
