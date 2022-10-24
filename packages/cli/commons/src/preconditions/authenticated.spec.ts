jest.mock('../platform/authenticatedClient');
jest.mock('../config/globalConfig');
jest.mock('../config/config');

import {Interfaces} from '@oclif/core';
import {Config} from '../config/config';
import globalConfig from '../config/globalConfig';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {getFakeCommand} from '@coveo/cli-commons-dev/testUtils/utils';
import {PreconditionError} from '../errors/preconditionError';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../platform/authenticatedClient';
import {AuthenticationType, IsAuthenticated} from './authenticated';

describe('authenticated', () => {
  const fakeCommand = getFakeCommand();
  const mockedAuthenticatedClient = jest.mocked(getAuthenticationStatus);
  const mockedGlobalConfig = jest.mocked(globalConfig);
  const mockedConfig = jest.mocked(Config);

  const doMockConfig = (anonymous: boolean) => {
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
    } as Interfaces.Config);
    const mockConfigGet = () => ({
      anonymous,
    });
    mockedConfig.mockReturnValue({
      get: mockConfigGet,
    } as Config);
  };

  beforeEach(() => {
    jest.resetAllMocks();
    doMockConfig(true);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe.each([
    [
      'is logged out',
      AuthenticationStatus.LOGGED_OUT,
      'Not currently logged in. Run coveo auth:login first.',
    ],
    [
      'authentication is expired',
      AuthenticationStatus.EXPIRED,
      'Authentication token is expired. Run coveo auth:login first.',
    ],
  ])(
    'when the user %s.',
    (
      _: unknown,
      authenticationStatus: AuthenticationStatus,
      expectedWarning: string
    ) => {
      fancyIt()(`warns '${expectedWarning}' and returns false`, async () => {
        mockedAuthenticatedClient.mockResolvedValue(authenticationStatus);
        await expect(IsAuthenticated()(fakeCommand)).rejects.toThrow(
          PreconditionError
        );
      });
    }
  );

  describe('when the user is logged in', () => {
    beforeEach(() => {
      mockedAuthenticatedClient.mockResolvedValue(
        AuthenticationStatus.LOGGED_IN
      );
    });

    const allAuthenticationsMethods: AuthenticationType[] = [
      AuthenticationType.ApiKey,
      AuthenticationType.OAuth,
    ];
    describe.each([
      {
        describeName:
          'when the user is anonymous (meaning it logged in with an API Key)',
        allowed: AuthenticationType.ApiKey,
        allowedAnonymousValue: true,
      },
      {
        describeName:
          'when the user is not anonymous (meaning it logged in with an API Key)',
        allowed: AuthenticationType.OAuth,
        allowedAnonymousValue: false,
      },
    ])(
      '$describeName',
      ({
        allowed,
        allowedAnonymousValue,
      }: {
        allowed: AuthenticationType;
        allowedAnonymousValue: boolean;
      }) => {
        beforeEach(() => {
          doMockConfig(allowedAnonymousValue);
        });
        it(`should not throw when ${allowed} is allowed`, async () => {
          mockedAuthenticatedClient.mockResolvedValue(
            AuthenticationStatus.LOGGED_IN
          );
          await expect(
            IsAuthenticated([allowed])(fakeCommand)
          ).resolves.not.toThrow();
        });

        it('should not throw when all methods of authentication are allowed', async () => {
          await expect(
            IsAuthenticated(allAuthenticationsMethods)(fakeCommand)
          ).resolves.not.toThrow();
        });

        it('should not throw when no methods of authentication is specified', async () => {
          await expect(IsAuthenticated()(fakeCommand)).resolves.not.toThrow();
        });

        it(`should throw when ${allowed} is not allowed`, async () => {
          await expect(
            IsAuthenticated(
              allAuthenticationsMethods.filter((method) => method !== allowed)
            )(fakeCommand)
          ).rejects.toThrowErrorMatchingSnapshot();
        });
      }
    );
  });
});
