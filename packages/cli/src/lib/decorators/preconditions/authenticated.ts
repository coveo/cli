import {
  PreconditionError,
  PreconditionErrorCategory,
} from '../../errors/preconditionError';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../platform/authenticatedClient';
import colors from '../../utils/color-utils';

export function IsAuthenticated() {
  return async function () {
    const status = await getAuthenticationStatus();
    if (status === AuthenticationStatus.LOGGED_OUT) {
      throw new PreconditionError(
        `Not currently logged in. Run ${colors.cmd('coveo auth:login')} first.`,
        {category: PreconditionErrorCategory.Authentication}
      );
    }

    if (status === AuthenticationStatus.EXPIRED) {
      throw new PreconditionError(
        `Authentication token is expired. Run ${colors.cmd(
          'coveo auth:login'
        )} first.`,
        {category: PreconditionErrorCategory.Authentication}
      );
    }
  };
}
