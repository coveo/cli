jest.mock('jsonschema');
jest.mock('@amplitude/node');
jest.mock('../../lib/config/config');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
jest.mock('./session');
jest.mock('./identifier');
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
import {Identifier} from './identifier';
const mockedConfig = mocked(Config);
const mockedPlatformClient = mocked(PlatformClient);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockedAuthenticationStatus = mocked(getAuthenticationStatus);
const mockedAmplitudeClient = mocked(init);
const mockedIdentifier = mocked(Identifier);

describe('analytics_hook', () => {
  const mockedLogEvent = jest.fn();
  const mockedUserGet = jest.fn();
  const mockedLicense = jest.fn();
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
    mockedAmplitudeClient.mockImplementation(
      () =>
        ({
          logEvent: mockedLogEvent as unknown,
        } as NodeClient)
    );
  };

  const doMockIdentifier = () => {
    mockedIdentifier.mockImplementation(
      () =>
        ({
          identify: () =>
            Promise.resolve({userId: 'user-123', deviceId: 'device-456'}),
        } as unknown as Identifier)
    );
  };

  const doMockPlatformClient = () => {
    mockedUserGet.mockReturnValue(
      Promise.resolve({
        username: 'bob@coveo.com',
        displayName: 'bob',
      })
    );
    mockedLicense.mockReturnValue(Promise.resolve({productType: 'TRIAL'}));
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
    doMockIdentifier();
  });

  afterEach(() => {
    mockedLicense.mockClear();
    mockedAmplitudeClient.mockClear();
    mockedPlatformClient.mockClear();
    mockedConfig.mockClear();
    mockedAuthenticatedClient.mockClear();
    mockedIdentifier.mockClear();
  });

  fancyIt()('should initialize an Amplitude client', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedAmplitudeClient).toHaveBeenCalledTimes(1);
  });

  fancyIt()('should log one event', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedLogEvent).toHaveBeenCalledTimes(1);
  });

  fancyIt()('should log event type and properties', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_properties: {key: 'value'},
        event_type: 'started foo bar',
      })
    );
  });

  fancyIt()('should identify the event', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        device_id: 'device-456',
        user_id: 'user-123',
      })
    );
  });

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
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  fancyIt()(
    'should not send any analytics if license is not TRIAL',
    async () => {
      mockedLicense.mockResolvedValue({productType: 'PROD'});

      await hook(getAnalyticsHook({}));
      expect(mockedLogEvent).not.toHaveBeenCalled();
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
