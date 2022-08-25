import {PlatformPrivilege} from '../decorators/preconditions/platformPrivilege';
import {PrintableError, SeverityLevel} from './printableError';

export class MissingPrivilegeError extends PrintableError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super(SeverityLevel.Error);
    this.message = privilege.unsatisfiedConditionMessage(Boolean(anonymous));
  }
}
