jest.mock('../../../lib/decorators/preconditions/npm');
jest.mock('../../../lib/decorators/preconditions/node');
jest.mock('../../../lib/decorators/preconditions/ng');
jest.mock('../../../lib/decorators/preconditions/apiKeyPrivilege');
jest.mock('../../../lib/utils/process');
jest.mock('../../../lib/oauth/oauth');
jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/utils/misc');
jest.mock('@coveord/platform-client');

import {test} from '@oclif/test';
import {spawnProcess} from '../../../lib/utils/process';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import {Config} from '../../../lib/config/config';
import {
  IsNpmVersionInRange,
  IsNodeVersionInRange,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions/';
import {getPackageVersion} from '../../../lib/utils/misc';
import {IsNgVersionInRange} from '../../../lib/decorators/preconditions/ng';
import {configurationMock} from '../../../__stub__/configuration';
import {mockPreconditions} from '../../../__test__/preconditionUtils';

describe('ui:create:angular', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess, true);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedIsNpmVersionInRange = jest.mocked(IsNpmVersionInRange, true);
  const mockedIsNodeVersionInRange = jest.mocked(IsNodeVersionInRange, true);
  const mockedIsNgInstalled = jest.mocked(IsNgVersionInRange, true);
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges, true);
  const mockedCreateImpersonateApiKey = jest.fn();
  const preconditionStatus = {
    node: true,
    npm: true,
    ng: true,
    apiKey: true,
  };
  const doMockPreconditions = function () {
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsNodeVersionInRange.mockReturnValue(mockedPreconditions.node);
    mockedIsNpmVersionInRange.mockReturnValue(mockedPreconditions.npm);
    mockedIsNgInstalled.mockReturnValue(mockedPreconditions.ng);
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
          getUserInfo: () => Promise.resolve('bob@coveo.com'),
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
    preconditionStatus.npm = true;
    preconditionStatus.node = true;
    preconditionStatus.ng = true;
    preconditionStatus.apiKey = true;
  });

  afterEach(() => {
    mockedIsNodeVersionInRange.mockClear();
    mockedIsNpmVersionInRange.mockClear();
  });

  test
    .stdout()
    .stderr()
    .do(() => {
      preconditionStatus.apiKey = false;
    })
    .command(['ui:create:angular', 'myapp'])
    .catch(/apiKey Precondition Error/)
    .it(
      'should not execute the command if the API key preconditions are not respected'
    );

  test
    .stdout()
    .stderr()
    .do(() => {
      preconditionStatus.npm = false;
    })
    .command(['ui:create:angular', 'myapp'])
    .catch(/npm Precondition Error/)
    .it(
      'should not execute the command if the preconditions are not respected'
    );

  test
    .stdout()
    .stderr()
    .command(['ui:create:angular'])
    .catch(/Missing 1 required arg/)
    .it('requires application name argument');

  test
    .stdout()
    .stderr()
    .command(['ui:create:angular', 'myapp'])
    .it(
      'should start a spawn process with the appropriate arguments',
      async () => {
        expect(mockedSpawnProcess).toHaveBeenCalledTimes(2);
        expect(mockedSpawnProcess).nthCalledWith(
          1,
          expect.stringContaining('ng'),
          ['new', 'myapp', '--style', 'scss', '--routing'],
          expect.objectContaining({})
        );
        expect(mockedSpawnProcess).nthCalledWith(
          2,
          expect.stringContaining('ng'),
          [
            'add',
            '@coveo/angular@1.0.0',
            '--org-id',
            'my-org',
            '--api-key',
            'foo',
            '--platform-url',
            'https://platformdev.cloud.coveo.com',
            '--user',
            'bob@coveo.com',
            '--skip-confirmation',
          ],
          expect.objectContaining({cwd: 'myapp'})
        );
        await Promise.resolve();
      }
    );
});
