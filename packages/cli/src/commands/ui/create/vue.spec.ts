jest.mock('../../../lib/decorators/preconditions/node');
jest.mock('../../../lib/decorators/preconditions/apiKeyPrivilege');
jest.mock('../../../lib/utils/process');
jest.mock('../../../lib/oauth/oauth');
jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/utils/misc');
jest.mock('@coveord/platform-client');

import {join} from 'path';
import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {spawnProcess} from '../../../lib/utils/process';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import {Config, Configuration} from '../../../lib/config/config';
import {
  IsNodeVersionInRange,
  hasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions/';
import {getPackageVersion} from '../../../lib/utils/misc';
import Command from '@oclif/command';

describe('ui:create:vue', () => {
  const mockedConfig = mocked(Config);
  const mockedSpawnProcess = mocked(spawnProcess, true);
  const mockedPlatformClient = mocked(PlatformClient);
  const mockedGetPackageVersion = mocked(getPackageVersion);
  const mockedAuthenticatedClient = mocked(AuthenticatedClient);
  const mockedIsNodeVersionInRange = mocked(IsNodeVersionInRange, true);
  const vueAppExecutable = join('@vue', 'cli', 'bin', 'vue.js'); //TODO: change that
  const mockedApiKeyPrivilege = mocked(hasNecessaryCoveoPrivileges, true);
  const mockedCreateImpersonateApiKey = jest.fn();
  const preconditionStatus = {
    node: true,
    apiKey: true,
  };
  const doMockPreconditions = function () {
    const mockNode = function (_target: Command) {
      return new Promise<boolean>((resolve) =>
        resolve(preconditionStatus.node)
      );
    };
    const mockApiKeyPrivilege = function (_target: Command) {
      return new Promise<boolean>((resolve) =>
        resolve(preconditionStatus.apiKey)
      );
    };
    mockedIsNodeVersionInRange.mockReturnValue(mockNode);
    mockedApiKeyPrivilege.mockReturnValue(mockApiKeyPrivilege);
  };

  const doMockSpawnProcess = () => {
    mockedSpawnProcess.mockResolvedValue(Promise.resolve(0));
  };

  const doMockedGetPackageVersion = () => {
    mockedGetPackageVersion.mockReturnValue('1.0.0');
  };

  const doMockConfiguration = () => {
    mockedConfig.mockImplementation(
      () =>
        ({
          get: () =>
            ({
              environment: 'dev',
              organization: 'my-org',
              region: 'us-east-1',
              analyticsEnabled: true,
            } as Configuration),
        } as Config)
    );
  };

  const doMockAuthenticatedClient = () => {
    mockedCreateImpersonateApiKey.mockImplementation((_name: string) =>
      Promise.resolve({value: 'foo'})
    );

    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          createImpersonateApiKey: mockedCreateImpersonateApiKey,
          getUserInfo: () =>
            Promise.resolve({
              username: 'bob@coveo.com',
              providerUsername: 'bob@coveo.com',
              displayName: 'bob',
            }),
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'foo',
                organizationId: 'my-org',
              })
            ),
          cfg: mockedConfig.getMockImplementation()!('./'),
        } as unknown as AuthenticatedClient)
    );
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
        } as PlatformClient)
    );
  };

  beforeEach(() => {
    doMockedGetPackageVersion();
    doMockSpawnProcess();
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
    doMockPreconditions();
    preconditionStatus.node = true;
    preconditionStatus.apiKey = true;
  });

  afterEach(() => {
    mockedIsNodeVersionInRange.mockClear();
    mockedApiKeyPrivilege.mockClear();
  });

  test
    .do(() => {
      preconditionStatus.apiKey = false;
    })
    .command(['ui:create:vue', 'myapp'])
    .it(
      'should not execute the command if the API key preconditions are not respected',
      async () => {
        expect(mockedCreateImpersonateApiKey).toHaveBeenCalledTimes(0);
      }
    );

  test
    .do(() => {
      preconditionStatus.node = false;
    })
    .command(['ui:create:vue', 'myapp'])
    .it(
      'should not execute the command if the preconditions are not respected',
      async () => {
        expect(mockedSpawnProcess).toHaveBeenCalledTimes(0);
      }
    );

  test
    .command(['ui:create:vue'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires application name argument', async () => {});

  test
    .command(['ui:create:vue', 'myapp'])
    .it('should start 2 spawn processes with default preset arguments', () => {
      expect(mockedSpawnProcess).toHaveBeenCalledTimes(2);
      expect(mockedSpawnProcess).nthCalledWith(
        1,
        'node',
        [
          expect.stringContaining(vueAppExecutable),
          'create',
          'myapp',
          '--inlinePreset',
          expect.objectContaining({}),
          '--skipGetStarted',
          '--bare',
        ],
        expect.objectContaining({})
      );
      expect(mockedSpawnProcess).nthCalledWith(
        2,
        'node',
        [
          expect.stringContaining(vueAppExecutable),
          'add',
          '@coveo/vue-cli-plugin-typescript@1.0.0',
          '--orgId',
          'my-org',
          '--apiKey',
          'foo',
          '--platformUrl',
          'https://platformdev.cloud.coveo.com',
          '--user',
          'bob@coveo.com',
        ],
        expect.objectContaining({cwd: 'myapp'})
      );
    });
});
