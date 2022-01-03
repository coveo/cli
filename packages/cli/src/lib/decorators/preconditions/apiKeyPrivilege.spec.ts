jest.mock('../../platform/authenticatedClient');
jest.mock('../../config/config');

import {IConfig} from '@oclif/config';
import {fancyIt} from '../../../__test__/it';
import {Config} from '../../config/config';
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
    global.config = {configDir: 'the_config_dir'} as IConfig;
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
});
