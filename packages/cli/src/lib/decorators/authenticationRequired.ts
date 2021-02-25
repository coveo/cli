/* eslint-disable @typescript-eslint/no-namespace */
import Command from '@oclif/command';
import {IConfig} from '@oclif/config';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../platform/authenticatedClient';

declare global {
  namespace NodeJS {
    interface Global {
      config: IConfig;
    }
  }
}

export default function AuthenticationRequired() {
  return function (
    target: Command,
    propertyKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor: TypedPropertyDescriptor<() => Promise<any>>
  ) {
    const originalRunCommand = descriptor.value!;
    descriptor.value = async function () {
      const status = await getAuthenticationStatus();

      if (status === AuthenticationStatus.LOGGED_OUT) {
        target.error('Not currently logged in. Run coveo auth:login first.');
      }

      if (status === AuthenticationStatus.EXPIRED) {
        target.error(
          'Authentication token is expired. Run coveo auth:login first.'
        );
      }

      originalRunCommand.apply(this);
    };
  };
}
