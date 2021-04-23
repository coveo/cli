jest.mock('../../../lib/decorators/preconditions/npm');
jest.mock('../../../lib/decorators/preconditions/node');
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
  IsNpmVersionInRange,
  IsNodeVersionInRange,
} from '../../../lib/decorators/preconditions/';
import {getPackageVersion} from '../../../lib/utils/misc';
import Command from '@oclif/command';

describe('ui:create:angular', () => {
  const mockedConfig = mocked(Config);
  const mockedSpawnProcess = mocked(spawnProcess, true);
  const mockedPlatformClient = mocked(PlatformClient);
  const mockedGetPackageVersion = mocked(getPackageVersion);
  const mockedAuthenticatedClient = mocked(AuthenticatedClient);
  const mockedIsNpmVersionInRange = mocked(IsNpmVersionInRange, true);
  const mockedIsNodeVersionInRange = mocked(IsNodeVersionInRange, true);
  const angularAppExecutable = join('@angular', 'cli', 'lib', 'init.js');
  const preconditionStatus = {
    node: true,
    npm: true,
  };
  const doMockPreconditions = function () {
    const mockNode = function (_target: Command) {
      return new Promise<boolean>((resolve) =>
        resolve(preconditionStatus.node)
      );
    };
    const mockNpm = function (_target: Command) {
      return new Promise<boolean>((resolve) => resolve(preconditionStatus.npm));
    };
    mockedIsNodeVersionInRange.mockReturnValueOnce(mockNode);
    mockedIsNpmVersionInRange.mockReturnValueOnce(mockNpm);
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
            Promise.resolve({
              environment: 'dev',
              organization: 'my-org',
              region: 'us-east-1',
              analyticsEnabled: true,
            } as Configuration),
        } as Config)
    );
  };

  const doMockAuthenticatedClient = () => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          createImpersonateApiKey: (_name: string) =>
            Promise.resolve({
              value: 'foo',
            }),
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'foo',
                organizationId: 'my-org',
              })
            ),
          cfg: mockedConfig.getMockImplementation()!('./'),
        } as AuthenticatedClient)
    );
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          user: {
            get: () =>
              Promise.resolve({
                username: 'bob@coveo.com',
                providerUsername: 'bob@coveo.com',
                displayName: 'bob',
              }),
          },
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
  });

  afterEach(() => {
    mockedIsNodeVersionInRange.mockClear();
    mockedIsNpmVersionInRange.mockClear();
  });

  test
    .do(() => {
      preconditionStatus.npm = false;
    })
    .stdout()
    .stderr()
    .command(['ui:create:angular', 'myapp'])
    .it(
      'should not execute the command if the preconditions are not respected',
      async () => {
        expect(mockedSpawnProcess).toHaveBeenCalledTimes(0);
      }
    );

  test
    .stdout()
    .stderr()
    .command(['ui:create:angular'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires application name argument', async () => {});

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
          'node',
          [
            expect.stringContaining(angularAppExecutable),
            'new',
            'myapp',
            '--style',
            'scss',
            '--routing',
          ],
          expect.objectContaining({})
        );
        expect(mockedSpawnProcess).nthCalledWith(
          2,
          'node',
          [
            expect.stringContaining(angularAppExecutable),
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
          ],
          expect.objectContaining({cwd: 'myapp'})
        );
        await Promise.resolve();
      }
    );

  // it('when the preconditions are not respected', () => {
  // beforeEach(() => {
  //   process.stdout.write('----small reset 2\n');
  //   doMockedGetPackageVersion();
  //   doMockSpawnProcess();
  //   doMockPlatformClient();
  //   doMockConfiguration();
  //   doMockAuthenticatedClient();
  // });

  // test
  //   .do(() => {
  //     process.stdout.write('----small reset 2\n');
  //     doMockedGetPackageVersion();
  //     doMockInvalidPreconditions();
  //     // doMockPreconditions();
  //     doMockSpawnProcess();
  //     doMockPlatformClient();
  //     doMockConfiguration();
  //     doMockAuthenticatedClient();
  //   })
  //   .command(['ui:create:angular', 'myapp'])
  //   .it('when the preconditions are not respected', (done) => {
  //     expect(mockedSpawnProcess).toHaveBeenCalledTimes(0);
  //     done();
  //   });

  // test
  //   .do(() => {
  //     process.stdout.write('----small reset 2\n');
  //     doMockedGetPackageVersion();
  //     // doMockInvalidPreconditions();
  //     doMockPreconditions();
  //     doMockSpawnProcess();
  //     doMockPlatformClient();
  //     doMockConfiguration();
  //     doMockAuthenticatedClient();
  //   })
  //   .command(['ui:create:angular', 'myapp'])
  //   .it('when the preconditions ardsadse not respected', () => {
  //     expect(mockedSpawnProcess).toHaveBeenCalledTimes(2);
  //   });
  // .end('requires application name argument', () => {
  //   process.stdout.write('----DONE!!\n');
  //   jest.resetAllMocks();
  // });
  // });
});
