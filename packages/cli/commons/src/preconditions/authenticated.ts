import {PreconditionError} from '../errors/preconditionError';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../platform/authenticatedClient';
import {Config} from '../config/config';
import globalConfig from '../config/globalConfig';
import {CLICommand} from '../command/cliCommand';
import {DecoratorFunction} from '../decorators/decoratorFunction';

const PRECONDITION_ERROR_CATEGORY = 'Authentication';
export enum AuthenticationType {
  OAuth = 'OAuth',
  ApiKey = 'ApiKey',
}

function getCurrentAuthenticationType() {
  const config = new Config(globalConfig.get().configDir).get();
  return config.anonymous
    ? AuthenticationType.ApiKey
    : AuthenticationType.OAuth;
}

export function IsAuthenticated(
  authenticationMethodAllowed: AuthenticationType[] = [
    AuthenticationType.ApiKey,
    AuthenticationType.OAuth,
  ]
): DecoratorFunction {
  return async function (_target: CLICommand) {
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

    const currentAuthenticationType = getCurrentAuthenticationType();
    if (authenticationMethodAllowed.includes(currentAuthenticationType)) {
      return;
    }

    switch (currentAuthenticationType) {
      case 'ApiKey':
        throw new PreconditionError(
          'This command does not support API Key authentication. Please authenticate again using coveo auth:login',
          {category: PRECONDITION_ERROR_CATEGORY}
        );
      case 'OAuth':
        throw new PreconditionError(
          'This command does not support OAuth/web authentication. Please authenticate again using coveo auth:token',
          {category: PRECONDITION_ERROR_CATEGORY}
        );
    }
  };
}
