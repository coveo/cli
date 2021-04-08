jest.mock('../config/config');
jest.mock('@coveord/platform-client');
import {IConfig} from '@oclif/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from './authenticatedClient';

import {Config} from '../config/config';
import {mocked} from 'ts-jest/utils';
import PlatformClient from '@coveord/platform-client';
import {
  castEnvironmentToPlatformClient,
  castRegionToPlatformClient,
} from './environment';
const mockConfig = mocked(Config);
const mockPlatformClient = mocked(PlatformClient);

describe('AuthenticatedClient', () => {
  const mockGet = jest.fn().mockReturnValue(
    Promise.resolve({
      environment: 'dev',
      region: 'eu-west-1',
      organization: 'my_org',
      accessToken: 'my_token',
    })
  );

  const mockInitialize = jest.fn();
  const mockCreate = jest.fn();

  mockConfig.mockImplementation(
    () =>
      (({
        get: mockGet,
      } as unknown) as Config)
  );
  mockPlatformClient.mockImplementation(
    () =>
      (({
        initialize: mockInitialize,
        apiKey: {
          create: mockCreate as unknown,
        },
      } as unknown) as PlatformClient)
  );

  beforeEach(() => {
    global.config = {configDir: 'the_config_dir'} as IConfig;
  });

  it('should automatically use the config dir as specified in the NodeJS.Global', () => {
    new AuthenticatedClient();
    expect(mockConfig).toHaveBeenCalledWith('the_config_dir');
  });

  it('should correctly identify #isLoggedIn if the config contains no access token', async () => {
    mockGet.mockReturnValueOnce(Promise.resolve({accessToken: undefined}));
    expect(await new AuthenticatedClient().isLoggedIn()).toBe(false);
  });

  it('should correctly identify #isLoggedIn if the config contains an access token', async () => {
    mockGet.mockReturnValueOnce(Promise.resolve({accessToken: 'the_token'}));
    expect(await new AuthenticatedClient().isLoggedIn()).toBe(true);
  });

  it('should correctly identify #isExpired if the platform client returns an error on initialize', async () => {
    mockInitialize.mockRejectedValueOnce('oh no');
    expect(await new AuthenticatedClient().isExpired()).toBe(true);
  });

  it('should correctly identify #isExpired if the platform client returns no error on initialize', async () => {
    mockInitialize.mockReturnValueOnce(Promise.resolve());
    expect(await new AuthenticatedClient().isExpired()).toBe(false);
    mockGet.mockClear();
  });

  it('should correctly initialize the #platformClient based on config', async () => {
    await new AuthenticatedClient().getClient();
    expect(mockPlatformClient).toHaveBeenLastCalledWith(
      expect.objectContaining({
        environment: castEnvironmentToPlatformClient('dev'),
        region: castRegionToPlatformClient('eu-west-1'),
        organizationId: 'my_org',
        accessToken: 'my_token',
      })
    );
  });

  it('#getAuthenticationStatus should return proper status if config contains no token', async () => {
    mockGet.mockReturnValueOnce({accessToken: undefined});
    expect(await getAuthenticationStatus()).toBe(
      AuthenticationStatus.LOGGED_OUT
    );
  });

  it('#getAuthenticationStatus should return proper status if token is expired', async () => {
    mockInitialize.mockRejectedValueOnce('boom');
    expect(await getAuthenticationStatus()).toBe(AuthenticationStatus.EXPIRED);
  });

  it('#getAuthenticationStatus should return proper status if token is not expired', async () => {
    mockInitialize.mockReturnValueOnce(Promise.resolve());
    expect(await getAuthenticationStatus()).toBe(
      AuthenticationStatus.LOGGED_IN
    );
  });

  it('should create an API key with impersonate privileges', async () => {
    await new AuthenticatedClient().createImpersonateApiKey('my-key');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'my-key',
        description: 'Generated by the Coveo CLI',
        enabled: true,
        privileges: [
          {targetDomain: 'IMPERSONATE', targetId: '*', owner: 'SEARCH_API'},
        ],
      })
    );
  });
});
