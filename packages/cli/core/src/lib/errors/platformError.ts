import {PlatformPrivilege} from '@coveo/cli-commons/src/preconditions/platformPrivilege';
import {
  PrintableError,
  SeverityLevel,
} from '@coveo/cli-commons/src/errors/printableError';

export class MissingPrivilegeError extends PrintableError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super(SeverityLevel.Error);
    this.message = privilege.unsatisfiedConditionMessage(Boolean(anonymous));
  }
}