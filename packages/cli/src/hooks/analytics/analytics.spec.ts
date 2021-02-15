jest.mock('coveo.analytics');
jest.mock('../../lib/config/config');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
import {mocked} from 'ts-jest/utils';
import {CoveoAnalyticsClient, IRuntimeEnvironment} from 'coveo.analytics';
import {Configuration, Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import hook, {AnalyticsHook} from './analytics';
import {IConfig} from '@oclif/config';
import {PlatformClient} from '@coveord/platform-client';
import {WebStorage} from 'coveo.analytics/dist/definitions/storage';
const mockedAnalytics = mocked(CoveoAnalyticsClient);
const mockedConfig = mocked(Config);
const mockedPlatformClient = mocked(PlatformClient);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);

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

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          user: {
            get: () =>
              Promise.resolve({
                username: 'bob@coveo.com',
                displayName: 'bob',
              }),
          },
        } as PlatformClient)
    );
  };

  const doMockConfiguration = () => {
    mockedConfig.mockImplementation(
      () =>
        ({
          get: () =>
            Promise.resolve({
              environment: 'dev',
              organization: 'foo',
              region: 'us-east-1',
              analyticsEnabled: true,
            } as Configuration),
        } as Config)
    );
  };

  const doMockAuthenticatedClient = () => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          isLoggedIn: () => Promise.resolve(true),
          isExpired: () => Promise.resolve(false),
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

  it('should properly format the command ID by removing semi colon and using underscore', async () => {
    await hook(getAnalyticsHook({commandID: 'hello:world'}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'com_coveo_cli',
        eventValue: 'hello_world',
        originLevel1: 'com_coveo_cli',
        originLevel2: 'hello_world',
      })
    );
  });

  it('should send user agent from config', async () => {
    await hook(getAnalyticsHook({config: {userAgent: 'the-agent'} as IConfig}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userAgent: 'the-agent',
      })
    );
  });

  it('should send operating system from config', async () => {
    await hook(getAnalyticsHook({config: {platform: 'linux'} as IConfig}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({os: 'linux'}),
      })
    );
  });

  it('should send environment from config', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({environment: 'dev'}),
      })
    );
  });

  it('should send organization from config', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({organization: 'foo'}),
      })
    );
  });

  it('should send region from config', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({region: 'us-east-1'}),
      })
    );
  });

  it('should send userDisplayName from platform-client', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userDisplayName: 'bob',
      })
    );
  });

  it('should send username from platform-client', async () => {
    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'bob@coveo.com',
      })
    );
  });

  it('should send command flags', async () => {
    const flags = {'-e': 'dev', '-r': 'us-east-1'};
    await hook(getAnalyticsHook({flags}));
    expect(sendCustomEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: expect.objectContaining({flags: JSON.stringify(flags)}),
      })
    );
  });

  it('should send meta (error)', async () => {
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

  it('should not send any analytics if disabled', async () => {
    mockedConfig.mockImplementation(
      () =>
        ({
          get: () =>
            Promise.resolve({
              analyticsEnabled: false,
            } as Configuration),
        } as Config)
    );

    await hook(getAnalyticsHook({}));
    expect(sendCustomEvent).not.toHaveBeenCalled();
  });

  it('should not throw an error when the user is not logged in', async () => {
    mockedAuthenticatedClient.mockImplementationOnce(
      () =>
        ({
          isLoggedIn: () => Promise.resolve(false),
        } as AuthenticatedClient)
    );

    expect(() => hook(getAnalyticsHook({}))).not.toThrow();
  });
});
