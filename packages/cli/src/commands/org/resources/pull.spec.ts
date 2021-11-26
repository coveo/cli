jest.mock('../../../lib/decorators/preconditions/git');
jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('../../../lib/utils/process');

import {Config} from '../../../lib/config/config';
import {mocked} from 'ts-jest/utils';
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {test} from '@oclif/test';
import {getDummySnapshotModel} from '../../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {Command} from '@oclif/core';
import {IsGitInstalled} from '../../../lib/decorators/preconditions';
import {PreconditionError} from '../../../lib/errors/preconditionError';

const mockedSnapshotFactory = mocked(SnapshotFactory, true);
const mockedConfig = mocked(Config);
const mockedConfigGet = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedDownloadSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedIsGitInstalled = mocked(IsGitInstalled, true);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockEvaluate = jest.fn();

const doMockConfig = () => {
  mockedConfigGet.mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'default-org',
      environment: 'prod',
    })
  );

  mockedConfig.prototype.get = mockedConfigGet;
};

const doMockPreconditions = () => {
  const preconditionStatus = {
    git: true,
  };

  const thrower = () => {
    throw new PreconditionError('Precondition error');
  };
  const mockGit = function (_target: Command) {
    return new Promise<void>((resolve) =>
      preconditionStatus.git ? resolve() : thrower()
    );
  };
  mockedIsGitInstalled.mockReturnValue(mockGit);
};

const mockAuthenticatedClient = () => {
  const mockGetClient = jest.fn().mockResolvedValue({
    privilegeEvaluator: {
      evaluate: mockEvaluate,
    },
  });

  mockedAuthenticatedClient.prototype.getClient = mockGetClient;
};

const mockUserHavingAllRequiredPlatformPrivileges = () => {
  mockEvaluate.mockResolvedValue({approved: true});
};

const mockUserNotHavingAllRequiredPlatformPrivileges = () => {
  mockEvaluate.mockResolvedValue({approved: false});
};

const doMockSnapshotFactory = async () => {
  mockedSnapshotFactory.createFromOrg.mockReturnValue(
    Promise.resolve({
      delete: mockedDeleteSnapshot,
      download: mockedDownloadSnapshot,
    } as unknown as Snapshot)
  );
};

describe('org:resources:pull', () => {
  beforeAll(() => {
    doMockConfig();
    doMockSnapshotFactory();
    mockAuthenticatedClient();

    mockedGetSnapshot.mockResolvedValue(
      getDummySnapshotModel('default-org', 'my-snapshot', [
        getSuccessReport('my-snapshot', ResourceSnapshotsReportType.Apply),
      ])
    );
  });

  beforeEach(() => {
    doMockPreconditions();
    mockUserHavingAllRequiredPlatformPrivileges();
  });

  afterEach(() => {
    mockEvaluate.mockClear();
    mockedIsGitInstalled.mockClear();
  });

  test
    .do(() => {
      mockUserNotHavingAllRequiredPlatformPrivileges();
    })
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .catch(/You are not authorized to create snapshot/)
    .it('should return an error message if privileges are missing');

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should download the snapshot', () => {
      expect(mockedDownloadSnapshot).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should delete the snapshot', () => {
      expect(mockedDeleteSnapshot).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should select all resource types', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([
          'FIELD',
          'FEATURED_RESULT',
          'SOURCE',
          'QUERY_PIPELINE',
          'SEARCH_PAGE',
          'EXTENSION',
        ]),
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-r', 'field', 'featuredResult', 'source'])
    .it('should select specified resource types', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        ['FIELD', 'FEATURED_RESULT', 'SOURCE'],
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should set a 60 seconds timeout', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([]),
        'default-org',
        {wait: 60}
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-w', '78'])
    .it('should set a 78 seconds timeout', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([]),
        'default-org',
        {wait: 78}
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-r', 'invalidresource'])
    .catch(/Expected --resourceTypes=invalidresource to be one of/)
    .it('should not allow invalid resource');
});
