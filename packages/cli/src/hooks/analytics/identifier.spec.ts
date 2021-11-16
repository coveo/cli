jest.mock('@amplitude/identify');
jest.mock('@amplitude/node');
jest.mock('@coveord/platform-client');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('../../lib/config/config');

import type {NodeClient} from '@amplitude/node';
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
  const mockAmplitudeIdentify = jest.fn();

  const getFakeAmplitudeClient = () => {
    return {
      identify: mockAmplitudeIdentify,
    } as unknown as NodeClient;
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

  const setupIdentifier = async () => {
    global.config = {configDir: 'the_config_dir'} as IConfig;

    const amplitudeClient = getFakeAmplitudeClient();
    const identifier = new Identifier(amplitudeClient);
    await identifier.identify();
  };
  const mockForInternalUser = async () => {
    doMockConfiguration();
    doMockPlatformClient('bob@coveo.com');
    await setupIdentifier();
  };
  const mockForExternalUser = async () => {
    doMockConfiguration();
    doMockPlatformClient('bob@acme.com');
    await setupIdentifier();
  };
  const mockForAnonymousUser = async () => {
    doMockConfiguration({anonymous: true});
    doMockPlatformClient();
    await setupIdentifier();
  };

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

    it('should set platform information', () => {
      expect(mockSetIdentity).toHaveBeenCalledWith(
        'organization_type',
        'Production'
      );
      expect(mockSetIdentity).toHaveBeenCalledWith('environment', 'dev');
      expect(mockSetIdentity).toHaveBeenCalledWith('region', 'us');
    });

    it('should set is_internal_user to true', () => {
      expect(mockSetIdentity).toHaveBeenCalledWith('is_internal_user', true);
    });

    it('should not identify event with (un-hashed) email', () => {
      const userIdCheck = expect.stringMatching(/^(?!bob@.*?\.com).*/);
      expect(mockAmplitudeIdentify).toHaveBeenCalledWith(
        userIdCheck,
        expect.anything(),
        expect.anything()
      );
    });

    it('should identify event with device ID', () => {
      const deviceIdCheck = expect.stringMatching(/.*/);
      expect(mockAmplitudeIdentify).toHaveBeenCalledWith(
        expect.anything(),
        deviceIdCheck,
        expect.anything()
      );
    });
  });

  describe('when the user is external', () => {
    beforeEach(async () => {
      await mockForExternalUser();
    });

    it('should set is_internal_user to false', () => {
      expect(mockSetIdentity).toHaveBeenCalledWith('is_internal_user', false);
    });
  });

  describe('when the user is anonymous', () => {
    beforeEach(async () => {
      await mockForAnonymousUser();
    });

    it('should set the user ID to null', () => {
      expect(mockAmplitudeIdentify).toHaveBeenCalledWith(
        null,
        expect.anything(),
        expect.anything()
      );
    });
  });
});
