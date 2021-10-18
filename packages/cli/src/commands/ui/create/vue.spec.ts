jest.mock('../../../lib/decorators/preconditions/npx');
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

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {spawnProcess} from '../../../lib/utils/process';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import {Config} from '../../../lib/config/config';
import {
  IsNodeVersionInRange,
  IsNpxInstalled,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions/';
import {getPackageVersion} from '../../../lib/utils/misc';
import Command from '@oclif/command';
import {configurationMock} from '../../../__stub__/configuration';

describe('ui:create:vue', () => {
  const mockedConfig = mocked(Config);
  const mockedSpawnProcess = mocked(spawnProcess, true);
  const mockedPlatformClient = mocked(PlatformClient);
  const mockedGetPackageVersion = mocked(getPackageVersion);
  const mockedAuthenticatedClient = mocked(AuthenticatedClient);
  const mockedIsNpxInstalled = mocked(IsNpxInstalled, true);
  const mockedIsNodeVersionInRange = mocked(IsNodeVersionInRange, true);
  const vueCliPackage = '@vue/cli';
  const mockedApiKeyPrivilege = mocked(HasNecessaryCoveoPrivileges, true);
  const mockedCreateImpersonateApiKey = jest.fn();
  const preconditionStatus = {
    node: true,
    npx: true,
    apiKey: true,
  };
  const doMockPreconditions = function () {
    const mockNode = function (_target: Command) {
      return new Promise<boolean>((resolve) =>
        resolve(preconditionStatus.node)
      );
    };
    const mockNpx = function (_target: Command) {
      return new Promise<boolean>((resolve) => resolve(preconditionStatus.npx));
    };
    const mockApiKeyPrivilege = function (_target: Command) {
      return new Promise<boolean>((resolve) =>
        resolve(preconditionStatus.apiKey)
      );
    };
    mockedIsNodeVersionInRange.mockReturnValue(mockNode);
    mockedIsNpxInstalled.mockReturnValue(mockNpx);
    mockedApiKeyPrivilege.mockReturnValue(mockApiKeyPrivilege);
  };

  const doMockSpawnProcess = () => {
    mockedSpawnProcess.mockResolvedValue(Promise.resolve(0));
  };

  const doMockedGetPackageVersion = () => {
    mockedGetPackageVersion.mockReturnValue('1.0.0');
  };

  const doMockConfiguration = () => {
    mockedConfig.mockImplementation(configurationMock());
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
    preconditionStatus.npx = true;
    preconditionStatus.apiKey = true;
  });

  afterEach(() => {
    mockedIsNodeVersionInRange.mockClear();
    mockedApiKeyPrivilege.mockClear();
  });

  test
    .stdout()
    .stderr()
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
    .stdout()
    .stderr()
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
    .stdout()
    .stderr()
    .command(['ui:create:vue'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires application name argument', async () => {});

  test
    .stdout()
    .stderr()
    .command(['ui:create:vue', 'myapp'])
    .it('should start 2 spawn processes with default preset arguments', () => {
      expect(mockedSpawnProcess).toHaveBeenCalledTimes(2);
      expect(mockedSpawnProcess).nthCalledWith(
        1,
        expect.stringContaining('npx'),
        [
          `${vueCliPackage}@1.0.0`,
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
        expect.stringContaining('npx'),
        [
          `${vueCliPackage}@1.0.0`,
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
