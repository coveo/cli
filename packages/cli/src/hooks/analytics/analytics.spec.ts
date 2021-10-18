jest.mock('coveo.analytics');
jest.mock('../../lib/config/config');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
import {mocked} from 'ts-jest/utils';
import {CoveoAnalyticsClient, IRuntimeEnvironment} from 'coveo.analytics';
import {Configuration, Config} from '../../lib/config/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';
import hook, {AnalyticsHook} from './analytics';
import {IConfig} from '@oclif/config';
import {PlatformClient} from '@coveord/platform-client';
import {WebStorage} from 'coveo.analytics/dist/definitions/storage';
import {
  configurationMock,
  defaultConfiguration,
} from '../../__stub__/configuration';
import {fancyIt} from '../../__test__/it';
const mockedAnalytics = mocked(CoveoAnalyticsClient);
const mockedConfig = mocked(Config);
const mockedPlatformClient = mocked(PlatformClient);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockedAuthenticationStatus = mocked(getAuthenticationStatus);

describe('analytics hook', () => {
  let sendCustomEvent: jest.Mock;
  const getAnalyticsHook = (input: Partial<AnalyticsHook>): AnalyticsHook => {
    return {
      commandID: 'foo:bar',
      config: {} as IConfig,
      flags: {},
      err: undefined,
      ...input,
    };
  };
  const doMockAnalytics = () => {
    sendCustomEvent = jest.fn();
    mockedAnalytics.mockImplementationOnce(
      () =>
        ({
          runtime: {storage: {} as WebStorage} as IRuntimeEnvironment,
          sendCustomEvent: sendCustomEvent as unknown,
        } as CoveoAnalyticsClient)
    );
  };

  const mockedUserGet = jest.fn();
  const doMockPlatformClient = () => {
    mockedUserGet.mockReturnValue(
      Promise.resolve({
        username: 'bob@coveo.com',
        displayName: 'bob',
      })
    );
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          user: {
            get: mockedUserGet,
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
    mockedAnalytics.mockClear();
    mockedPlatformClient.mockClear();
    mockedConfig.mockClear();
    mockedAuthenticatedClient.mockClear();
    sendCustomEvent.mockClear();
  });

  fancyIt()(
    'should properly format the command ID by removing semi colon and using underscore',
    async () => {
      await hook(getAnalyticsHook({commandID: 'hello:world'}));
      expect(sendCustomEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'com_coveo_cli',
          eventValue: 'hello_world',
          originLevel1: 'com_coveo_cli',
          originLevel2: 'hello_world',
        })
      );
    }
  );

  fancyIt()('should send user agent from config', async () => {
    await hook(getAnalyticsHook({config: {userAgent: 'the-agent'} as IConfig}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userAgent: 'the-agent',
      })
    );
  });

  fancyIt()('should send operating system from config', async () => {
    await hook(getAnalyticsHook({config: {platform: 'linux'} as IConfig}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({os: 'linux'}),
      })
    );
  });

  fancyIt()('should send environment from config', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({environment: 'dev'}),
      })
    );
  });

  fancyIt()('should send organization from config', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({organization: 'my-org'}),
      })
    );
  });

  fancyIt()('should send region from config', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({region: 'us'}),
      })
    );
  });

  fancyIt()('should send userDisplayName from platform-client', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userDisplayName: 'bob',
      })
    );
  });

  fancyIt()('should send username from platform-client', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'bob@coveo.com',
      })
    );
  });

  fancyIt()('should send command flags', async () => {
    const flags = {'-e': 'dev', '-r': 'us'};
    await hook(getAnalyticsHook({flags}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({flags: JSON.stringify(flags)}),
      })
    );
  });

  fancyIt()('should send meta (error)', async () => {
    const err: Error = new Error('oh no');
    await hook(getAnalyticsHook({err}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({
          errorMessage: err.message,
          errorName: err.name,
          errorStacktrace: err.stack,
        }),
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
    expect(sendCustomEvent).not.toHaveBeenCalled();
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
