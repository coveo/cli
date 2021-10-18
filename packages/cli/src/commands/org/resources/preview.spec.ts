jest.mock('../../../lib/decorators/preconditions/git');
jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshot');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('../../../lib/snapshot/snapshotFacade');
jest.mock('@oclif/errors');

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {Project} from '../../../lib/project/project';
import {join, normalize} from 'path';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {error} from '@oclif/errors';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {
  getErrorReport,
  getSuccessReport,
} from '../../../__stub__/resourceSnapshotsReportModel';
import {Command} from '@oclif/command';
import {IsGitInstalled} from '../../../lib/decorators/preconditions';
import {SnapshotFacade} from '../../../lib/snapshot/snapshotFacade';

const mockedSnapshotFactory = mocked(SnapshotFactory, true);
const mockedConfig = mocked(Config);
const mockedProject = mocked(Project);
const mockedError = mocked(error);
const mockedConfigGet = jest.fn();
const mockedDeleteTemporaryZipFile = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedAreResourcesInError = jest.fn();
const mockedValidateSnapshot = jest.fn();
const mockedPreviewSnapshot = jest.fn();
const mockedLastReport = jest.fn();
const mockedCreateSynchronizationPlan = jest.fn();
const mockedApplySynchronizationPlan = jest.fn();
const mockedTryAutomaticSynchronization = jest.fn();
const mockedIsGitInstalled = mocked(IsGitInstalled, true);
const mockedSnapshotFacade = mocked(SnapshotFacade, true);

const mockProject = () => {
  mockedProject.mockImplementation(
    () =>
      ({
        compressResources: () =>
          Promise.resolve(normalize(join('path', 'to', 'resources.zip'))),
        deleteTemporaryZipFile: mockedDeleteTemporaryZipFile,
      } as unknown as Project)
  );
};

const mockConfig = () => {
  mockedConfigGet.mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'foo',
      environment: 'prod',
    })
  );

  // TODO: use prototype
  mockedConfig.mockImplementation(
    () =>
      ({
        get: mockedConfigGet,
      } as unknown as Config)
  );
};

const mockSnapshotFactory = async () => {
  mockedSnapshotFactory.createFromZip.mockReturnValue(
    Promise.resolve({
      validate: mockedValidateSnapshot,
      preview: mockedPreviewSnapshot,
      delete: mockedDeleteSnapshot,
      saveDetailedReport: mockedSaveDetailedReport,
      areResourcesInError: mockedAreResourcesInError,
      latestReport: mockedLastReport,
      createSynchronizationPlan: mockedCreateSynchronizationPlan,
      applySynchronizationPlan: mockedApplySynchronizationPlan,
      id: 'banana-snapshot',
      targetId: 'potato-org',
    } as unknown as Snapshot)
  );
};

const mockSnapshotFactoryReturningValidSnapshot = async () => {
  const successReport = getSuccessReport(
    'success-report',
    ResourceSnapshotsReportType.Apply
  );
  const reporter = new SnapshotReporter(successReport);
  mockedValidateSnapshot.mockResolvedValue(reporter);
  await mockSnapshotFactory();
};

const mockSnapshotFactoryReturningInvalidSnapshot = async () => {
  const errorReport = getErrorReport(
    'error-report',
    ResourceSnapshotsReportType.Apply
  );
  const reporter = new SnapshotReporter(errorReport);
  mockedValidateSnapshot.mockResolvedValue(reporter);
  await mockSnapshotFactory();
};

const mockSnapshotFacade = () => {
  mockedSnapshotFacade.prototype.tryAutomaticSynchronization =
    mockedTryAutomaticSynchronization;
};

describe('org:resources:preview', () => {
  const preconditionStatus = {
    git: true,
  };
  const doMockPreconditions = function () {
    const mockGit = function (_target: Command) {
      return new Promise<boolean>((resolve) => resolve(preconditionStatus.git));
    };
    mockedIsGitInstalled.mockReturnValue(mockGit);
  };

  beforeAll(() => {
    mockConfig();
    mockProject();
  });
  beforeEach(() => {
    doMockPreconditions();
  });
  afterEach(() => {
    mockedIsGitInstalled.mockClear();
  });
  describe('when the report contains no resources in error', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningValidSnapshot();
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should use cwd as project', () => {
        expect(mockedProject).toHaveBeenCalledWith(cwd());
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should work with default connected org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          expect.objectContaining({})
        );
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview', '-t', 'myorg'])
      .it('should work with specified target org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'myorg',
          expect.objectContaining({})
        );
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should set a 60 seconds wait', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          {wait: 60}
        );
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview', '-w', '312'])
      .it('should set a 312 seconds wait', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          {wait: 312}
        );
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('#validate should not take into account missing resources', () => {
        expect(mockedValidateSnapshot).toHaveBeenCalledWith(false, {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview', '-d'])
      .it('#validate should take into account missing resoucres', () => {
        expect(mockedValidateSnapshot).toHaveBeenCalledWith(true, {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should delete the compressed folder', () => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedValidateSnapshot.mockImplementationOnce(() => {
          throw new Error('You shall not pass');
        });
      })
      .command(['org:resources:preview'])
      .catch(() => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      })
      .it('should delete the compressed folder on error');

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should delete the snapshot', () => {
        expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should display expanded preview', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          true
        );
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview', '--previewLevel', 'light'])
      .it('should only display light preview', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          false
        );
      });
  });

  describe('when the report contains resources in error', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningInvalidSnapshot();
    });

    beforeEach(() => {
      mockedAreResourcesInError.mockReturnValueOnce(false);
      mockedSaveDetailedReport.mockReturnValueOnce(
        normalize(join('saved', 'snapshot'))
      );
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should throw an error for invalid snapshots', () => {
        expect(mockedError).toHaveBeenCalledWith(
          expect.stringContaining('Invalid snapshot')
        );
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should print an URL to the snapshot page', () => {
        expect(mockedError).toHaveBeenCalledWith(
          expect.stringContaining(
            'https://platform.cloud.coveo.com/admin/#potato-org/organization/resource-snapshots/banana-snapshot'
          )
        );
      });
  });

  describe('when the snapshot is not in sync with the target org', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningInvalidSnapshot();
      mockSnapshotFacade();
    });

    beforeEach(() => {
      mockedAreResourcesInError.mockReturnValueOnce(true);
      mockedSaveDetailedReport.mockReturnValueOnce(join('saved', 'snapshot'));
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should have detected and tried to resolves the conflicts', () => {
        expect(mockedTryAutomaticSynchronization).toHaveBeenCalledWith(true);
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview', '--sync'])
      .it(
        'should try to apply synchronization plan without asking for confirmation',
        () => {
          expect(mockedTryAutomaticSynchronization).toHaveBeenCalledWith(false);
        }
      );
  });
});
