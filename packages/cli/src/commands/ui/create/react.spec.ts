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
jest.mock('../../../lib/utils/npx');
jest.mock('@coveord/platform-client');

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {spawnProcessOutput} from '../../../lib/utils/process';
import {npxInPty} from '../../../lib/utils/npx';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import {Config, Configuration} from '../../../lib/config/config';
import {
  IsNpxInstalled,
  IsNodeVersionInRange,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions/';
import {getPackageVersion} from '../../../lib/utils/misc';
import Command from '@oclif/command';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {IPty} from 'node-pty';

describe('ui:create:react', () => {
  const mockedConfig = mocked(Config);
  const mockedNpxInPty = mocked(npxInPty);
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  const mockedPlatformClient = mocked(PlatformClient);
  const mockedGetPackageVersion = mocked(getPackageVersion);
  const mockedAuthenticatedClient = mocked(AuthenticatedClient);
  const mockedIsNpxInstalled = mocked(IsNpxInstalled, true);
  const mockedIsNodeVersionInRange = mocked(IsNodeVersionInRange, true);
  const mockedApiKeyPrivilege = mocked(HasNecessaryCoveoPrivileges, true);
  const mockedCreateImpersonateApiKey = jest.fn();
  const processExitCode = {
    spawn: 0,
    spawnOutput: 0,
  };
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
    mockedSpawnProcessOutput.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: processExitCode.spawn,
    });

    mockedNpxInPty.mockResolvedValue({
      onData: () => {},
      onExit: (callback: (e: {exitCode: number}) => void) =>
        callback({exitCode: processExitCode.spawnOutput}),
    } as unknown as IPty);
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
    preconditionStatus.npx = true;
    preconditionStatus.node = true;
    preconditionStatus.apiKey = true;
    processExitCode.spawn = 0;
    processExitCode.spawnOutput = 0;
  });

  afterEach(() => {
    mockedIsNodeVersionInRange.mockClear();
    mockedIsNpxInstalled.mockClear();
    mockedApiKeyPrivilege.mockClear();
  });

  test
    .do(() => {
      preconditionStatus.apiKey = false;
    })
    .command(['ui:create:react', 'myapp'])
    .it(
      'should not execute the command if the API key preconditions are not respected',
      async () => {
        expect(mockedCreateImpersonateApiKey).toHaveBeenCalledTimes(0);
      }
    );

  test
    .do(() => {
      preconditionStatus.npx = false;
    })
    .command(['ui:create:react', 'myapp'])
    .it(
      'should not execute the command if the preconditions are not respected',
      async () => {
        expect(mockedNpxInPty).toHaveBeenCalledTimes(0);
      }
    );

  test
    .command(['ui:create:react'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires application name argument');

  test
    .command(['ui:create:react', 'myapp'])
    .it('should spawn on regular process once', async () => {
      expect(mockedNpxInPty).toHaveBeenCalledTimes(1);
    });

  test
    .command(['ui:create:react', 'myapp'])
    .it('should spawn 2 output processes', async () => {
      expect(mockedSpawnProcessOutput).toHaveBeenCalledTimes(2);
    });

  test
    .command(['ui:create:react', 'myapp'])
    .it('should start a process to create the project', () => {
      expect(mockedNpxInPty).nthCalledWith(
        1,
        [
          'create-react-app',
          'myapp',
          '--template',
          '@coveo/cra-template@1.0.0',
        ],
        expect.objectContaining({})
      );
    });

  test
    .command(['ui:create:react', 'myapp'])
    .it('should start an output process to setup the server', () => {
      expect(mockedSpawnProcessOutput).nthCalledWith(
        1,
        appendCmdIfWindows`npm`,
        ['run', 'setup-server'],
        expect.objectContaining({})
      );
    });

  test
    .command(['ui:create:react', 'myapp'])
    .it('should start an output process setup environment variables', () => {
      expect(mockedSpawnProcessOutput).nthCalledWith(
        2,
        appendCmdIfWindows`npm`,
        [
          'run',
          'setup-env',
          '--',
          '--orgId',
          'my-org',
          '--apiKey',
          'foo',
          '--platformUrl',
          'https://platformdev.cloud.coveo.com',
          '--user',
          'bob@coveo.com',
        ],
        {cwd: 'myapp'}
      );
    });

  test
    .do(() => {
      processExitCode.spawnOutput = 99;
    })
    .command(['ui:create:react', 'myapp'])
    .catch(/unable to create the project/)
    .it('should start an output process setup environment variables');
});
