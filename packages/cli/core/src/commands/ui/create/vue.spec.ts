jest.mock('../../../lib/decorators/preconditions/npx');
jest.mock('../../../lib/decorators/preconditions/node');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');
jest.mock('../../../lib/utils/process');
jest.mock('../../../lib/oauth/oauth');
jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('../../../lib/utils/misc');
jest.mock('@coveo/platform-client');

import {test} from '@oclif/test';
import {spawnProcess} from '../../../lib/utils/process';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import {
  IsNodeVersionInRange,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions/index';
import {HasNecessaryCoveoPrivileges} from '@coveo/cli-commons/preconditions/index';
import {getPackageVersion} from '../../../lib/utils/misc';
import {configurationMock} from '../../../__stub__/configuration';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';

describe('ui:create:vue', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedIsNpxInstalled = jest.mocked(IsNpxInstalled);
  const mockedIsNodeVersionInRange = jest.mocked(IsNodeVersionInRange);
  const vueCliPackage = '@vue/cli';
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges);
  const mockedCreateImpersonateApiKey = jest.fn();
  const preconditionStatus = {
    node: true,
    npx: true,
    apiKey: true,
  };
  const doMockPreconditions = function () {
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsNodeVersionInRange.mockReturnValue(mockedPreconditions.node);
    mockedIsNpxInstalled.mockReturnValue(mockedPreconditions.npx);
    mockedApiKeyPrivilege.mockReturnValue(mockedPreconditions.apiKey);
  };

  const doMockSpawnProcess = () => {
    mockedSpawnProcess.mockResolvedValue(0);
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
          getUsername: () => Promise.resolve('bob@coveo.com'),
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
    .catch(/apiKey Precondition Error/)
    .it(
      'should not execute the command if the API key preconditions are not respected'
    );

  test
    .stdout()
    .stderr()
    .do(() => {
      preconditionStatus.node = false;
    })
    .command(['ui:create:vue', 'myapp'])
    .catch(/node Precondition Error/)
    .it(
      'should not execute the command if the preconditions are not respected'
    );

  test
    .stdout()
    .stderr()
    .command(['ui:create:vue'])
    .catch(/Missing 1 required arg/)
    .it('requires application name argument');

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
