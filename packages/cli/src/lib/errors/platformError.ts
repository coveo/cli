import {PlatformPrivilege} from '../decorators/preconditions/platformPrivilege';
import {SeverityLevel, SnapshotError} from './snapshotErrors';

// TODO: CDX-646 rename "SnapshotError" class to "PrintableError"
export class MissingPrivilegeError extends SnapshotError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super(SeverityLevel.Error);
    this.message = privilege.unsatisfiedConditionMessage(Boolean(anonymous));
  }
}
