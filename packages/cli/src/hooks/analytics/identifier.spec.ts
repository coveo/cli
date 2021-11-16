jest.mock('@amplitude/identify');
jest.mock('@coveord/platform-client');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('../../lib/config/config');

import {Identify} from '@amplitude/identify';
import {mocked} from 'ts-jest/utils';
import {Config, Configuration} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {Identifier} from './identifier';
import PlatformClient from '@coveord/platform-client';
import {
  configurationMock,
  defaultConfiguration,
} from '../../__stub__/configuration';
import {IConfig} from '@oclif/config';

describe('identifier', () => {
  const mockedConfig = mocked(Config);
  const mockedIdentify = mocked(Identify, true);
  const mockedAuthenticatedClient = mocked(AuthenticatedClient);
  const mockedPlatformClient = mocked(PlatformClient);
  const mockUserGet = jest.fn();
  const mockSetIdentity = jest.fn();

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
    global.config = {configDir: 'the_config_dir'} as IConfig;
  });

  beforeEach(() => {
    doMockIdentify();
    doMockAuthenticatedClient();
  });

  describe('when the user is internal', () => {
    beforeEach(async () => {
      await mockForInternalUser();
    });

    afterEach(() => {
      mockUserGet.mockClear();
      mockedPlatformClient.mockClear();
    });

    it('should set platform information', async () => {
      await new Identifier().getIdentity();
      expect(mockSetIdentity).toHaveBeenCalledWith(
        'organization_type',
        'Production'
      );
      expect(mockSetIdentity).toHaveBeenCalledWith('environment', 'dev');
      expect(mockSetIdentity).toHaveBeenCalledWith('region', 'us');
    });

    it('should set the user ID', async () => {
      const identity = await new Identifier().getIdentity();
      expect(identity.userId).not.toBeNull();
    });

    it('should set is_internal_user to true', async () => {
      await new Identifier().getIdentity();
      expect(mockSetIdentity).toHaveBeenCalledWith('is_internal_user', true);
    });

    it('should not identify event with (un-hashed) email', async () => {
      const identity = await new Identifier().getIdentity();
      expect(identity.userId).not.toMatch(/^bob@.*?\.com$.*/);
    });

    it('should always identify events with a device ID', async () => {
      const identity = await new Identifier().getIdentity();
      expect(identity.deviceId).toBeDefined();
    });
  });

  describe('when the user is external', () => {
    beforeEach(async () => {
      await mockForExternalUser();
    });

    it('should set the user ID', async () => {
      const identity = await new Identifier().getIdentity();
      expect(identity.userId).not.toBeNull();
    });

    it('should set is_internal_user to false', async () => {
      await new Identifier().getIdentity();
      expect(mockSetIdentity).toHaveBeenCalledWith('is_internal_user', false);
    });
  });

  describe('when the user is anonymous', () => {
    beforeEach(async () => {
      await mockForAnonymousUser();
    });

    it('should set the user ID to null', async () => {
      const identity = await new Identifier().getIdentity();
      expect(identity.userId).toBeNull();
    });
  });
});
