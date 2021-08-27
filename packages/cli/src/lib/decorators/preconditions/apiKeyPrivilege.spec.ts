jest.mock('@oclif/command');
jest.mock('../../platform/authenticatedClient');
jest.mock('../../config/config');

import {IConfig} from '@oclif/config';
import {mocked} from 'ts-jest/utils';
import {Config} from '../../config/config';
import {AuthenticatedClient} from '../../platform/authenticatedClient';
import {HasNecessaryCoveoPrivileges} from './apiKeyPrivilege';
import {getFakeCommand} from './testsUtils/utils';

const mockConfig = mocked(Config);

describe('apiKeyPrivilege', () => {
  const mockedAuthenticatedClient = mocked(AuthenticatedClient);
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
    [
      true,
      false,
      'You are not authorized to create an API Key with the Impersonate privilege',
    ],
    [false, true, 'You are not authorized to create an API Key'],
  ])(
    'when the API key condition is %s and the impersonate condition is %s.',
    (
      apiKeyCondition: boolean,
      impersonateCondition: boolean,
      expectedWarning: string
    ) => {
      it(`warns '${expectedWarning}' and returns false`, async () => {
        mockEvaluate
          .mockReturnValueOnce({approved: apiKeyCondition})
          .mockReturnValueOnce({approved: impersonateCondition});

        const fakeCommand = getFakeCommand();
        await expect(HasNecessaryCoveoPrivileges()(fakeCommand)).resolves.toBe(
          false
        );
        expect(fakeCommand.warn).toHaveBeenCalledTimes(1);
        expect(fakeCommand.warn).toHaveBeenCalledWith(
          expect.stringContaining(expectedWarning)
        );
      });
    }
  );

  describe('when the user has all the required privileges', () => {
    beforeEach(() => {
      mockEvaluate.mockReturnValue({approved: true});
    });

    it('returns true and does not warn', async () => {
      const fakeCommand = getFakeCommand();
      await expect(HasNecessaryCoveoPrivileges()(fakeCommand)).resolves.toBe(
        true
      );
      expect(fakeCommand.warn).not.toHaveBeenCalled();
    });
  });
});
