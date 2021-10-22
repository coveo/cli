import {
  PreconditionError,
  PreconditionErrorCategory,
} from '../../errors/preconditionError';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../platform/authenticatedClient';

export function IsAuthenticated() {
  return async function () {
    const status = await getAuthenticationStatus();
    if (status === AuthenticationStatus.LOGGED_OUT) {
      throw new PreconditionError(
        'Not currently logged in. Run coveo auth:login first.',
        PreconditionErrorCategory.Authentication
      );
    }

    if (status === AuthenticationStatus.EXPIRED) {
      throw new PreconditionError(
        'Authentication token is expired. Run coveo auth:login first.',
        PreconditionErrorCategory.Authentication
      );
    }
  };
}
