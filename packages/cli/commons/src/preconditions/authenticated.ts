import {Command} from '@oclif/core';
import {PreconditionError} from '../errors/preconditionError';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../platform/authenticatedClient';

const PRECONDITION_ERROR_CATEGORY = 'Authentication';

export function IsAuthenticated() {
  return async function (_target: Command) {
    const status = await getAuthenticationStatus();
    if (status === AuthenticationStatus.LOGGED_OUT) {
      throw new PreconditionError(
        'Not currently logged in. Run coveo auth:login first.',
        {category: PRECONDITION_ERROR_CATEGORY}
      );
    }

    if (status === AuthenticationStatus.EXPIRED) {
      throw new PreconditionError(
        'Authentication token is expired. Run coveo auth:login first.',
        {category: PRECONDITION_ERROR_CATEGORY}
      );
    }
  };
}
