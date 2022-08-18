jest.mock('../../platform/authenticatedClient');

import {fancyIt} from '../../../__test__/it';
import {PreconditionError} from '../../errors/preconditionError';
import {
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../platform/authenticatedClient';
import {IsAuthenticated} from './authenticated';

describe('authenticated', () => {
  const mockedAuthenticatedClient = jest.mocked(getAuthenticationStatus);

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
        await expect(IsAuthenticated()()).rejects.toThrow(PreconditionError);
      });
    }
  );

  describe('when the user is logged in', () => {
    fancyIt()('should not throw', async () => {
      mockedAuthenticatedClient.mockResolvedValue(
        AuthenticationStatus.LOGGED_IN
      );
      await expect(IsAuthenticated()()).resolves.not.toThrow();
    });
  });
});
