jest.mock('../../platform/authenticatedClient');
jest.mock('@oclif/command');

import {mocked} from 'ts-jest/utils';
import {fancyIt} from '../../../__test__/it';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../platform/authenticatedClient';
import {IsAuthenticated} from './authenticated';
import {getFakeCommand} from './testsUtils/utils';

describe('authenticated', () => {
  const mockedAuthenticatedClient = mocked(getAuthenticationStatus);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.fn();
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
        const fakeCommand = getFakeCommand();

        await expect(IsAuthenticated()(fakeCommand)).resolves.toBe(false);
        expect(fakeCommand.warn).toHaveBeenCalledTimes(1);
        expect(fakeCommand.warn).toHaveBeenCalledWith(expectedWarning);
      });
    }
  );

  describe('when the user is logged in', () => {
    fancyIt()('returns true and does not warn', async () => {
      mockedAuthenticatedClient.mockResolvedValue(
        AuthenticationStatus.LOGGED_IN
      );
      const fakeCommand = getFakeCommand();

      await expect(IsAuthenticated()(fakeCommand)).resolves.toBe(true);
      expect(fakeCommand.warn).not.toHaveBeenCalled();
    });
  });
});
