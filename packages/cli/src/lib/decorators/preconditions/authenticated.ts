import Command from '@oclif/command';
import {Config} from '../../config/config';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../platform/authenticatedClient';

export function IsAuthenticated() {
  return async function (target: Command) {
    const cfg = new Config(global.config.configDir);

    const {organization} = await cfg.get();

    if (!organization || organization.length === 0) {
      target.warn(
        'Not currently logged to a specific organization. Run coveo auth:login or config:set.'
      );
      return false;
    }

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
