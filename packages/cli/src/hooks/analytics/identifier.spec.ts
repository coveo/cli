jest.mock('@amplitude/node');
jest.mock('@amplitude/identify');
jest.mock('@coveord/platform-client');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('../../lib/config/config');
jest.mock('os');

import {release} from 'os';
import {Identify} from '@amplitude/identify';
import {Config, Configuration} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {Identifier} from './identifier';
import PlatformClient from '@coveord/platform-client';
import {
  configurationMock,
  defaultConfiguration,
} from '../../__stub__/configuration';
import {IConfig} from '@oclif/config';
import type {NodeClient} from '@amplitude/node';

describe('identifier', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedIdentify = jest.mocked(Identify, true);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockUserGet = jest.fn();
  const mockSetIdentity = jest.fn();
  const mockedLogEvent = jest.fn();
  const mockedOsVersion = mocked(release);

  let identity: Awaited<ReturnType<Identifier['getIdentity']>>;

  const getDummyAmplitudeClient = () =>
    ({
      logEvent: mockedLogEvent,
    } as unknown as NodeClient);

  const doMockOS = () => {
    mockedOsVersion.mockReturnValue('21.3.4');
  };
  const doMockIdentify = () => {
    mockedIdentify.prototype.set.mockImplementation(mockSetIdentity);
  };
  const doMockPlatformClient = (email = '') => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          user: {
            get: mockUserGet.mockResolvedValue({
              email,
            }),
          },
          organization: {
            get: jest.fn().mockResolvedValue({type: 'Production'}),
          },
        } as unknown as PlatformClient)
    );
  };
  const doMockConfiguration = (
    overrideConfiguration?: Partial<Configuration>
  ) => {
    mockedConfig.mockImplementation(
      configurationMock({...defaultConfiguration, ...overrideConfiguration})
    );
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
        } as unknown as AuthenticatedClient)
    );
  };

  const mockForInternalUser = async () => {
    doMockConfiguration();
    doMockPlatformClient('bob@coveo.com');
  };
  const mockForExternalUser = async () => {
    doMockConfiguration();
    doMockPlatformClient('bob@acme.com');
  };
  const mockForAnonymousUser = async () => {
    doMockConfiguration({anonymous: true});
    doMockPlatformClient();
  };

  beforeAll(() => {
    global.config = {
      configDir: 'the_config_dir',
      version: '1.2.3',
      platform: 'darwin',
    } as IConfig;
  });

  beforeEach(() => {
    doMockOS();
    doMockIdentify();
    doMockAuthenticatedClient();
  });

  describe('when the user is internal', () => {
    beforeEach(async () => {
      await mockForInternalUser();
      identity = await new Identifier().getIdentity();
    });

    afterEach(() => {
      mockUserGet.mockClear();
      mockedPlatformClient.mockClear();
    });

    it('should not set platform information', async () => {
      expect(mockSetIdentity).not.toHaveBeenCalledWith(
        'organization_type',
        'Production'
      );
      expect(mockSetIdentity).not.toHaveBeenCalledWith('environment', 'dev');
      expect(mockSetIdentity).not.toHaveBeenCalledWith('region', 'us');
    });

    it('should set the user ID', async () => {
      expect(identity.userId).not.toBeNull();
    });

    it('should set is_internal_user to true', async () => {
      expect(mockSetIdentity).toHaveBeenCalledWith('is_internal_user', true);
    });

    it('should not identify event with (un-hashed) email', async () => {
      expect(identity.userId).not.toMatch(/^bob@.*?\.com$/);
    });

    it('should always identify events with a device ID', async () => {
      expect(identity.deviceId).toBeDefined();
    });
  });

  describe('when the user is external', () => {
    beforeEach(async () => {
      await mockForExternalUser();
      identity = await new Identifier().getIdentity();
    });

    it('should set the user ID', async () => {
      expect(identity.userId).not.toBeNull();
    });

    it('should set is_internal_user to false', async () => {
      expect(mockSetIdentity).toHaveBeenCalledWith('is_internal_user', false);
    });
  });

  describe('when the user is anonymous', () => {
    beforeEach(async () => {
      await mockForAnonymousUser();
      identity = await new Identifier().getIdentity();
    });

    it('should set the user ID to null', async () => {
      expect(identity.userId).toBeNull();
    });
  });

  describe('when logging for every user type', () => {
    let identity: Awaited<ReturnType<Identifier['getIdentity']>>;

    beforeEach(async () => {
      identity = await new Identifier().getIdentity();
      identity.identify(getDummyAmplitudeClient());
    });

    it('should add the CLI version to the event', async () => {
      expect(mockedLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({app_version: '1.2.3'})
      );
    });

    it('should add the OS information to the event', async () => {
      expect(mockedLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          app_version: '1.2.3',
          os_name: 'darwin',
          os_version: '21.3.4',
          platform: 'darwin',
        })
      );
    });
  });
});
