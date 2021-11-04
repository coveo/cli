jest.mock('jsonschema');
jest.mock('@amplitude/node');
jest.mock('../../lib/config/config');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
import {mocked} from 'ts-jest/utils';
import {Configuration, Config} from '../../lib/config/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';
import hook, {AnalyticsHook} from './analytics';
import {IConfig} from '@oclif/config';
import {PlatformClient} from '@coveord/platform-client';
import {
  configurationMock,
  defaultConfiguration,
} from '../../__stub__/configuration';
import {fancyIt} from '../../__test__/it';
import {init, NodeClient} from '@amplitude/node';
const mockedConfig = mocked(Config);
const mockedPlatformClient = mocked(PlatformClient);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockedAuthenticationStatus = mocked(getAuthenticationStatus);
const mockedAmplitudeClient = mocked(init);

describe('analytics_hook', () => {
  let logEvent: jest.Mock;
  const getAnalyticsHook = (input: Partial<AnalyticsHook>): AnalyticsHook => {
    return {
      event: {
        event_type: 'started foo bar',
        event_properties: {
          key: 'value',
        },
      },
      config: {} as IConfig,
      ...input,
    };
  };
  const doMockAnalytics = () => {
    logEvent = jest.fn();
    mockedAmplitudeClient.mockImplementationOnce(
      () =>
        ({
          logEvent: logEvent as unknown,
        } as NodeClient)
    );
  };

  const mockedUserGet = jest.fn();
  const mockedLicense = jest.fn();
  const doMockPlatformClient = () => {
    mockedUserGet.mockReturnValue(
      Promise.resolve({
        username: 'bob@coveo.com',
        displayName: 'bob',
      })
    );
    mockedLicense.mockReturnValue(Promise.resolve({type: 'TRIAL'}));
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          user: {
            get: mockedUserGet,
          },
          license: {
            full: mockedLicense,
          },
        } as unknown as PlatformClient)
    );
  };

  const doMockConfiguration = () => {
    mockedConfig.mockImplementation(configurationMock());
  };

  const doMockAuthenticatedClient = () => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'foo',
                organizationId: 'bar',
              })
            ),
          cfg: mockedConfig.getMockImplementation()!('./'),
        } as AuthenticatedClient)
    );
    mockedAuthenticationStatus.mockImplementation(() =>
      Promise.resolve(AuthenticationStatus.LOGGED_IN)
    );
  };

  beforeEach(() => {
    doMockAnalytics();
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
  });

  afterEach(() => {
    mockedLicense.mockClear();
    mockedAmplitudeClient.mockClear();
    mockedPlatformClient.mockClear();
    mockedConfig.mockClear();
    mockedAuthenticatedClient.mockClear();
    logEvent.mockClear();
  });

  fancyIt()('should initialize an Amplitude client', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedAmplitudeClient).toHaveBeenCalledTimes(1);
  });

  it.todo('TODO: CDX-651: should send environment from config');
  it.todo('TODO: CDX-651: should send organization type from config');
  it.todo('TODO: CDX-651: should send region from config');
  it.todo('TODO: CDX-651: should send hashed username from platform-client');

  fancyIt()('should not send any analytics if disabled', async () => {
    mockedConfig.mockImplementation(
      () =>
        ({
          get: () =>
            ({
              analyticsEnabled: false,
            } as Configuration),
        } as Config)
    );

    await hook(getAnalyticsHook({}));
    expect(logEvent).not.toHaveBeenCalled();
  });

  fancyIt()(
    'should not send any analytics if license is not TRIAL',
    async () => {
      mockedLicense.mockResolvedValue({type: 'PROD'});

      await hook(getAnalyticsHook({}));
      expect(logEvent).not.toHaveBeenCalled();
    }
  );

  fancyIt()(
    'should not throw an error when the user is not logged in',
    async () => {
      mockedAuthenticationStatus.mockImplementationOnce(() =>
        Promise.resolve(AuthenticationStatus.LOGGED_OUT)
      );

      await expect(hook(getAnalyticsHook({}))).resolves.not.toThrow();
    }
  );

  fancyIt()('should not throw an error when the user is expired', async () => {
    mockedAuthenticationStatus.mockImplementationOnce(() =>
      Promise.resolve(AuthenticationStatus.EXPIRED)
    );
    await expect(hook(getAnalyticsHook({}))).resolves.not.toThrow();
  });

  fancyIt()(
    'should not fetch userinfo if anonymous is set to true in the config',
    async () => {
      mockedConfig.mockImplementation(
        configurationMock({...defaultConfiguration, anonymous: true})
      );

      await hook(getAnalyticsHook({}));

      expect(mockedUserGet).not.toBeCalled();
    }
  );
});
