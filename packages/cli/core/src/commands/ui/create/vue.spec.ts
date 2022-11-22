jest.mock('../../../lib/decorators/preconditions/npx.js');
jest.mock('../../../lib/decorators/preconditions/node.js');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/platform-client');

jest.mock('../../../lib/utils/process.js');
jest.mock('../../../lib/oauth/oauth.js');
jest.mock('../../../lib/utils/misc.js');
jest.mock('../../../lib/utils/os.js');

jest.mock('node:fs');
jest.mock('node:path');
jest.mock('node:process', () => ({
  cwd: () => '/foo/bar',
}));

import {join} from 'node:path';
import {join as posixJoin} from 'node:path/posix';
import {test} from '@oclif/test';
import {spawnProcess} from '../../../lib/utils/process.js';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import {
  IsNodeVersionInRange,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions/index';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {getPackageVersion} from '../../../lib/utils/misc.js';
import {configurationMock} from '../../../__stub__/configuration.js';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {
  Stats,
  statSync,
  readdirSync,
  mkdirSync,
  Dirent,
  writeFileSync,
} from 'node:fs';
import {formatAbsolutePath} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';
import {appendCmdIfWindows} from '../../../lib/utils/os.js';

describe('ui:create:vue', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedIsNpxInstalled = jest.mocked(IsNpxInstalled);
  const mockedIsNodeVersionInRange = jest.mocked(IsNodeVersionInRange);
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges);
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedStatSync = jest.mocked(statSync);
  const mockedReadDirSync = jest.mocked(readdirSync);
  const mockedMkdirSync = jest.mocked(mkdirSync);
  const mockedWriteFileSync = jest.mocked(writeFileSync);
  const mockAppendCmdIfWindows = jest.mocked(appendCmdIfWindows);
  const mockedPathJoin = jest.mocked(join);
  const fooBarDirectoryMatcher = /(\w:)?(\\|\/)foo(\\|\/)bar(\\|\/)myapp/gm;
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

  const doMockAppendCmdIfWindows = () => {
    mockAppendCmdIfWindows.mockImplementation(
      (input: TemplateStringsArray) => `${input}`
    );
  };

  const doMockPathJoin = () => {
    mockedPathJoin.mockImplementation(posixJoin);
  };

  beforeEach(() => {
    doMockedGetPackageVersion();
    doMockSpawnProcess();
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
    doMockPreconditions();
    doMockPathJoin();
    doMockAppendCmdIfWindows();
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

  describe('when a file with the projectName exists', () => {
    beforeEach(() => {
      const mockedIsDir = jest.fn();
      mockedIsDir.mockReturnValue(false);
      mockedStatSync.mockReturnValue({
        isDirectory: mockedIsDir,
      } as unknown as Stats);
    });

    test
      .stdout()
      .stderr()
      .command(['ui:create:vue', 'myapp'])
      .catch((err) => {
        expect(formatAbsolutePath(err.message)).toMatchSnapshot();
      })
      .it('should exit with an error', () => {
        expect(mockedSpawnProcess).not.toBeCalled();
      });
  });

  describe('when a directory with the projectName exists', () => {
    beforeEach(() => {
      const mockedIsDir = jest.fn();
      mockedIsDir.mockReturnValue(true);
      mockedStatSync.mockReturnValue({
        isDirectory: mockedIsDir,
      } as unknown as Stats);
    });

    describe('when the directory is not empty', () => {
      beforeEach(() => {
        mockedReadDirSync.mockReturnValue([{} as unknown as Dirent]);
      });

      test
        .stdout()
        .stderr()
        .command(['ui:create:vue', 'myapp'])
        .catch((err) => {
          expect(formatAbsolutePath(err.message)).toMatchSnapshot();
        })
        .it('should exit with an error', () => {
          expect(mockedSpawnProcess).not.toBeCalled();
        });
    });

    describe('when the directory is empty', () => {
      beforeEach(() => {
        mockedReadDirSync.mockReturnValue([]);
      });

      test
        .stdout()
        .stderr()
        .command(['ui:create:vue', 'myapp'])
        .it('should not try to create the dir', () => {
          expect(mockedMkdirSync).not.toBeCalled();
        });

      test
        .stdout()
        .stderr()
        .command(['ui:create:vue', 'myapp'])
        .it('should scaffold the project with npm init', () => {
          expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
            1,
            'npm',
            ['init', expect.stringContaining('@coveo/headless-vue')],
            {cwd: '/foo/bar/myapp'}
          );
        });

      test
        .stdout()
        .stderr()
        .command(['ui:create:vue', 'myapp'])
        .it('should install the dependencies', () => {
          expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
            2,
            'npm',
            ['install'],
            {cwd: '/foo/bar/myapp'}
          );
        });

      test
        .stdout()
        .stderr()
        .command(['ui:create:vue', 'myapp'])
        .it('should write the .env file', () => {
          expect(mockedWriteFileSync).toBeCalledTimes(1);
          expect(mockedWriteFileSync.mock.calls[0]).toMatchSnapshot();
        });
    });
  });

  describe('when the projectName does not exists yet', () => {
    beforeEach(() => {
      mockedStatSync.mockReturnValue(undefined);
    });

    test
      .stdout()
      .stderr()
      .command(['ui:create:vue', 'myapp'])
      .it('should create the dir', () => {
        expect(mockedMkdirSync).toBeCalledWith(
          expect.stringMatching(fooBarDirectoryMatcher)
        );
      });

    test
      .stdout()
      .stderr()
      .command(['ui:create:vue', 'myapp'])
      .it('should scaffold the project with npm init', () => {
        expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
          1,
          'npm',
          ['init', expect.stringContaining('@coveo/headless-vue')],
          {cwd: '/foo/bar/myapp'}
        );
      });

    test
      .stdout()
      .stderr()
      .command(['ui:create:vue', 'myapp'])
      .it('should install the dependencies', () => {
        expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
          2,
          'npm',
          ['install'],
          {cwd: '/foo/bar/myapp'}
        );
      });

    test
      .stdout()
      .stderr()
      .command(['ui:create:vue', 'myapp'])
      .it('should write the .env file', () => {
        expect(mockedWriteFileSync).toBeCalledTimes(1);
        expect(mockedWriteFileSync.mock.calls[0]).toMatchSnapshot();
      });
  });
});
