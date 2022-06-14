import {PlatformPrivilege} from '../decorators/preconditions/platformPrivilege.js';
import {PrintableError, SeverityLevel} from './printableError.js';

export class MissingPrivilegeError extends PrintableError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super(SeverityLevel.Error);
    this.message = privilege.unsatisfiedConditionMessage(Boolean(anonymous));
  }
}
