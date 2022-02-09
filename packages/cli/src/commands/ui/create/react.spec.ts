jest.mock('child_process');
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

import {test} from '@oclif/test';
import {spawnProcess, spawnProcessOutput} from '../../../lib/utils/process';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import {Config} from '../../../lib/config/config';
import {
  IsNpxInstalled,
  IsNodeVersionInRange,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions/';
import {getPackageVersion} from '../../../lib/utils/misc';
import {configurationMock} from '../../../__stub__/configuration';
import {mockPreconditions} from '../../../__test__/preconditionUtils';

describe('ui:create:react', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess, true);
  const mockedSpawnProcessOutput = jest.mocked(spawnProcessOutput, true);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedIsNpxInstalled = jest.mocked(IsNpxInstalled, true);
  const mockedIsNodeVersionInRange = jest.mocked(IsNodeVersionInRange, true);
  const createReactAppPackage = 'create-react-app@latest';
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges, true);
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
    mockedSpawnProcess.mockReturnValue(Promise.resolve(0));
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
    .command(['ui:create:react', 'myapp'])
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
    .command(['ui:create:react', 'myapp'])
    .catch(/node Precondition Error/)
    .it(
      'should not execute the command if the preconditions are not respected'
    );

  test
    .stdout()
    .stderr()
    .command(['ui:create:react'])
    .catch(/Missing 1 required arg/)
    .it('requires application name argument');

  test
    .stdout()
    .stderr()
    .command(['ui:create:react', 'myapp'])
    .it('should run 2 spawn processes', () => {
      expect(mockedSpawnProcess).toHaveBeenCalledTimes(1);
      expect(mockedSpawnProcessOutput).toHaveBeenCalledTimes(1);
    });

  test
    .stdout()
    .stderr()
    .command(['ui:create:react', 'myapp'])
    .it('should start 1 spawn processes with the good template', () => {
      expect(mockedSpawnProcess).nthCalledWith(
        1,
        expect.stringContaining('npx'),
        [
          createReactAppPackage,
          'myapp',
          '--template',
          '@coveo/cra-template@1.0.0',
        ]
      );
    });

  test
    .stdout()
    .stderr()
    .command(['ui:create:react', 'myapp', '-v=1.2.3'])
    .it('should use the version from the flag if provided', () => {
      expect(mockedSpawnProcess).nthCalledWith(
        1,
        expect.stringContaining('npx'),
        [
          createReactAppPackage,
          'myapp',
          '--template',
          '@coveo/cra-template@1.2.3',
        ]
      );
    });

  test
    .stdout()
    .stderr()
    .command(['ui:create:react', 'myapp', '-v=1.2.3'])
    .it('should setup environment variables', () => {
      expect(mockedSpawnProcessOutput).nthCalledWith(
        1,
        expect.stringContaining('npm'),
        ['run', 'setup-env'],
        expect.objectContaining({
          env: expect.objectContaining({
            orgId: expect.any(String),
            apiKey: expect.any(String),
            user: expect.any(String),
            platformUrl: expect.any(String),
          }),
        })
      );
    });

  test
    .stdout()
    .stderr()
    .do(() => {
      mockedSpawnProcess.mockReturnValueOnce(Promise.resolve(1));
    })
    .command(['ui:create:react', 'myapp'])
    .catch((ctx) => {
      expect(ctx.message).toBe(
        'create-react-app was unable to create the project. See the logs above for more information.'
      );
    })
    .it('should blame create-react-app if it fails.', async () => {});
});
