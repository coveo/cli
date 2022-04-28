import dedent from 'ts-dedent';
import {PrintableError, SeverityLevel} from './printableError';

export class InvalidVaultEntry extends PrintableError {
  public name = 'Invalid Vault Entries';
  public constructor(public organizationId: string, public vaultEntry: string) {
    super(SeverityLevel.Error);
    this.message = dedent`Cannot create vault entry ${vaultEntry} in your organization ${organizationId}.
    Visit https://docs.coveo.com/en/m3a90243 for more info on how to create vault entries.`;
  }
}
