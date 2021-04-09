import Command from '@oclif/command';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../platform/authenticatedClient';

export function IsAuthenticated() {
  return async function (target: Command) {
    const status = await getAuthenticationStatus();
    if (status === AuthenticationStatus.LOGGED_OUT) {
      target.warn('Not currently logged in. Run coveo auth:login first.');
      return false;
    }

    if (status === AuthenticationStatus.EXPIRED) {
      target.warn(
        'Authentication token is expired. Run coveo auth:login first.'
      );
      return false;
    }

    return true;
  };
}
