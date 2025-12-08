jest.mock('../../../../lib/lib/decorators/preconditions/npx');
jest.mock('../../../../lib/lib/decorators/preconditions/node');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');
jest.mock('../../../../lib/lib/utils/process');
jest.mock('../../../../lib/lib/oauth/oauth');
jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('../../../../lib/lib/utils/misc');
jest.mock('@coveo/platform-client');
jest.mock('../../../../lib/lib/ui/shared');

import {test} from '@oclif/test';
import {
  spawnProcess,
  spawnProcessOutput,
} from '../../../../lib/lib/utils/process';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import {
  IsNpxInstalled,
  IsNodeVersionInRange,
} from '../../../../lib/lib/decorators/preconditions/index';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {getPackageVersion} from '../../../../lib/lib/utils/misc';
import {configurationMock} from '../../../__stub__/configuration';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {promptForSearchHub} from '../../../../lib/lib/ui/shared';

describe('ui:create:react', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedSpawnProcessOutput = jest.mocked(spawnProcessOutput);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedIsNpxInstalled = jest.mocked(IsNpxInstalled);
  const mockedIsNodeVersionInRange = jest.mocked(IsNodeVersionInRange);
  const createReactAppPackage = 'create-react-app@latest';
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges);
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedPromptForSearchHub = jest.mocked(promptForSearchHub);

  const mockedCreateImpersonateApiKey = jest.fn();
  const preconditionStatus = {
    node: true,
    npx: true,
    apiKey: true,
    authentication: true,
  };
  const doMockPreconditions = function () {
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsNodeVersionInRange.mockReturnValue(mockedPreconditions.node);
    mockedIsNpxInstalled.mockReturnValue(mockedPreconditions.npx);
    mockedApiKeyPrivilege.mockReturnValue(mockedPreconditions.apiKey);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
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
    mockedPromptForSearchHub.mockResolvedValue('default');
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
          '--use-npm',
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
          '--use-npm',
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
    .catch((err) => {
      expect(err.message).toBe(
        'create-react-app was unable to create the project. See the logs above for more information.'
      );
    })
    .it('should blame create-react-app if it fails.', async () => {});
});
