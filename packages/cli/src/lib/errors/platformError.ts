import {PlatformPrivilege} from '../decorators/preconditions/platformPrivilege';
import {CLIBaseError, SeverityLevel} from './CLIBaseError';

export class MissingPrivilegeError extends CLIBaseError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super({
      message: privilege.unsatisfiedConditionMessage(Boolean(anonymous)),
      level: SeverityLevel.Error,
    });
  }
}
