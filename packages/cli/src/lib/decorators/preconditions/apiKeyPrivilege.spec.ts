jest.mock('../../platform/authenticatedClient');
jest.mock('../../config/config');
jest.mock('../../config/globalConfig');

import {Interfaces} from '@oclif/core';
import {fancyIt} from '../../../__test__/it';
import {Config} from '../../config/config';
import globalConfig from '../../config/globalConfig';
import {AuthenticatedClient} from '../../platform/authenticatedClient';
import {HasNecessaryCoveoPrivileges} from './apiKeyPrivilege';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
  PlatformPrivilege,
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from './platformPrivilege';
import {getFakeCommand} from './testsUtils/utils';

const mockConfig = jest.mocked(Config);
const mockedGlobalConfig = jest.mocked(globalConfig);

describe('apiKeyPrivilege', () => {
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockEvaluate = jest.fn();
  const mockGet = jest.fn().mockReturnValue({
    environment: 'dev',
    region: 'eu-west-1',
    organization: 'my_org',
    accessToken: 'my_token',
  });
  const mockGetClient = jest.fn().mockResolvedValue({
    privilegeEvaluator: {
      evaluate: mockEvaluate,
    },
  });

  mockConfig.prototype.get = mockGet;
  mockedAuthenticatedClient.prototype.getClient = mockGetClient;

  beforeEach(() => {
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
      version: '1.2.3',
      platform: 'darwin',
    } as Interfaces.Config);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe.each([
    [createApiKeyPrivilege, 'You are not authorized to create an API Key'],
    [
      impersonatePrivilege,
      'You are not authorized to create an API Key with the Impersonate privilege',
    ],
  ])(
    'when the API key condition is %s and the impersonate condition is %s.',
    (privilege: PlatformPrivilege, expectedWarning: string) => {
      fancyIt()(`warns '${expectedWarning}' and returns false`, async () => {
        mockEvaluate.mockReturnValueOnce({approved: false});

        const fakeCommand = getFakeCommand();
        await expect(
          HasNecessaryCoveoPrivileges(privilege).call(fakeCommand, fakeCommand)
        ).rejects.toThrow(expectedWarning);
      });
    }
  );

  describe('when the user has all the required privileges', () => {
    const privileges = [writeSnapshotPrivilege, writeLinkPrivilege];
    beforeEach(() => {
      mockEvaluate.mockReturnValue({approved: true});
    });

    fancyIt()('returns true and does not warn', async () => {
      const fakeCommand = getFakeCommand();
      await expect(
        HasNecessaryCoveoPrivileges(...privileges).call(
          fakeCommand,
          fakeCommand
        )
      ).resolves.not.toThrow();
    });
  });

  describe('when the command has a public `flags` getter', () => {
    const privileges = [writeSnapshotPrivilege, writeLinkPrivilege];
    beforeEach(() => {
      mockEvaluate.mockReturnValue({approved: true});
    });

    fancyIt()('should use it', async () => {
      const fakeCommand = getFakeCommand();
      const getSpy = jest.fn(() => ({
        target: 'someTarget',
      }));
      Object.defineProperty(fakeCommand, 'getFlags', {
        value: getSpy,
      });
      await HasNecessaryCoveoPrivileges(...privileges).call(
        fakeCommand,
        fakeCommand
      );
      expect(getSpy).toBeCalled();
    });
  });
});
