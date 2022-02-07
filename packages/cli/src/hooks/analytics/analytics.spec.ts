jest.mock('jsonschema');
jest.mock('@amplitude/node');
jest.mock('../../lib/config/config');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
jest.mock('./session');
jest.mock('../../lib/config/globalConfig');

import {Configuration, Config} from '../../lib/config/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';
import hook, {AnalyticsHook} from './analytics';
import {Interfaces} from '@oclif/core';
import {PlatformClient} from '@coveord/platform-client';
import {configurationMock} from '../../__stub__/configuration';
import {fancyIt} from '../../__test__/it';
import globalConfig from '../../lib/config/globalConfig';
const mockedGlobalConfig = jest.mocked(globalConfig);
const mockedConfig = jest.mocked(Config);
const mockedPlatformClient = jest.mocked(PlatformClient);
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedAuthenticationStatus = jest.mocked(getAuthenticationStatus);
const mockedLogEvent = jest.fn();

jest.mock('./amplitudeClient', () => ({
  get amplitudeClient() {
    return {
      logEvent: mockedLogEvent,
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
      config: {} as Interfaces.Config,
      ...input,
    };
  };

  const doMockPlatformClient = () => {
    mockedUserGet.mockResolvedValue({
      email: 'bob@coveo.com',
      username: 'bob@coveo.com',
      displayName: 'bob',
    });
    mockedLicense.mockReturnValue({productType: 'TRIAL'});
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
          organization: {
            get: jest.fn().mockResolvedValue({type: 'Production'}),
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

  beforeAll(() => {
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
    } as Interfaces.Config);
  });

  beforeEach(() => {
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
  });

  afterEach(() => {
    mockedLicense.mockClear();
    mockedPlatformClient.mockClear();
    mockedConfig.mockClear();
    mockedAuthenticatedClient.mockClear();
  });

  fancyIt()('should log one event', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedLogEvent).toHaveBeenCalledTimes(1);
  });

  fancyIt()('should log event type and default properties', async () => {
    await hook(getAnalyticsHook({}));
    expect(mockedLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_properties: {
          environment: 'dev',
          key: 'value',
          organization_type: 'Production',
          region: 'us',
        },
        event_type: 'started foo bar',
      })
    );
  });

  describe('when identify option is set to false', () => {
    beforeEach(async () => {
      await hook(getAnalyticsHook({}));
    });
    fancyIt()('should only log one event', async () => {
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
    });

    fancyIt()('should not log any identify event', async () => {
      expect(mockedLogEvent).toHaveReturnedWith(
        expect.not.objectContaining({event_type: '$identify'})
      );
    });
  });

  describe('when identify option is set to true', () => {
    beforeEach(async () => {
      await hook(getAnalyticsHook({identify: true}));
    });

    fancyIt()('should log 2 events', async () => {
      expect(mockedLogEvent).toHaveBeenCalledTimes(2);
    });

    fancyIt()('should log an identify event', async () => {
      expect(mockedLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({event_type: '$identify'})
      );
    });

    fancyIt()('should not identify event with (un-hashed) email', async () => {
      const userIdCheck = expect.stringMatching(/^(?!bob@.*?\.com).*/);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({user_id: userIdCheck})
      );
    });

    fancyIt()('should identify event with device ID', async () => {
      const deviceIdCheck = expect.stringMatching(/.*/);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({device_id: deviceIdCheck})
      );
    });
  });

  fancyIt()('should identify the event', async () => {
    await hook(getAnalyticsHook({}));
    const nonEmptyString = expect.stringMatching(/.+/);
    expect(mockedLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        device_id: nonEmptyString,
        user_id: nonEmptyString,
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
});
