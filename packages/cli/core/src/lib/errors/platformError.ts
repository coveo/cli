import {PlatformPrivilege} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {CLIBaseError} from '@coveo/cli-commons/errors/cliBaseError';

export class MissingPrivilegeError extends CLIBaseError {
  public constructor(
    public privilege: PlatformPrivilege,
    public anonymous?: boolean
  ) {
    super(privilege.unsatisfiedConditionMessage(Boolean(anonymous)));
  }
}
