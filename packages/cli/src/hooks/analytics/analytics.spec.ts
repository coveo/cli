jest.mock('jsonschema');
jest.mock('@amplitude/node');
jest.mock('../../lib/config/config');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
jest.mock('./session');
jest.mock('./identifier');

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
import {Identifier} from './identifier';
const mockedConfig = jest.mocked(Config);
const mockedPlatformClient = jest.mocked(PlatformClient);
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedAuthenticationStatus = jest.mocked(getAuthenticationStatus);
const mockedIdentifier = jest.mocked(Identifier);
const mockedLogEvent = jest.fn();
const mockedIdentify = jest.fn();

jest.mock('./amplitudeClient', () => ({
  get amplitudeClient() {
    return {
      logEvent: mockedLogEvent,
      identify: mockedIdentify,
    };
  },
}));
describe('analytics_hook', () => {
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

  const doMockIdentifier = () => {
    mockedIdentifier.mockImplementation(
      () =>
        ({
          getIdentity: () =>
            Promise.resolve({
              userId: 'user-123',
              deviceId: 'device-456',
              identify: {},
            }),
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
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
    doMockIdentifier();
  });

  afterEach(() => {
    mockedLicense.mockClear();
    mockedPlatformClient.mockClear();
    mockedConfig.mockClear();
    mockedAuthenticatedClient.mockClear();
    mockedIdentifier.mockClear();
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

  fancyIt()('should not identify the user if not asked', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedIdentify).toHaveBeenCalledTimes(0);
  });

  fancyIt()('should identify the user only if asked', async () => {
    await hook(getAnalyticsHook({identify: true}));
    expect(mockedIdentify).toHaveBeenCalledTimes(1);
  });

  fancyIt()('should not identify event with (un-hashed) email', async () => {
    await hook(getAnalyticsHook({identify: true}));
    const userIdCheck = expect.stringMatching(/^(?!bob@.*?\.com).*/);
    expect(mockedIdentify).toHaveBeenCalledWith(
      userIdCheck,
      expect.anything(),
      expect.anything()
    );
  });

  fancyIt()('should identify event with device ID', async () => {
    await hook(getAnalyticsHook({identify: true}));
    const deviceIdCheck = expect.stringMatching(/.*/);
    expect(mockedIdentify).toHaveBeenCalledWith(
      expect.anything(),
      deviceIdCheck,
      expect.anything()
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

  fancyIt()('should send analytics regardless of the license', async () => {
    mockedLicense.mockResolvedValue({productType: 'ANYTHING_BUT_TRIAL'});

    await hook(getAnalyticsHook({}));
    expect(mockedLogEvent).toHaveBeenCalled();
  });

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
