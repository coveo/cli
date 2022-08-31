import {PlatformPrivilege} from '../decorators/preconditions/platformPrivilege';
import {CLIBaseError} from './CLIBaseError';

export class MissingPrivilegeError extends CLIBaseError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super(privilege.unsatisfiedConditionMessage(Boolean(anonymous)));
  }
}
