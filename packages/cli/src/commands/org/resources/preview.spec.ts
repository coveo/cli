jest.mock('../../../lib/decorators/preconditions/git');
jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshot');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('../../../lib/snapshot/snapshotFacade');

import {test} from '@oclif/test';
import {Project} from '../../../lib/project/project';
import {join, normalize} from 'path';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {
  getErrorReport,
  getMissingVaultEntryReport,
  getSuccessReport,
} from '../../../__stub__/resourceSnapshotsReportModel';
import {CliUx, Command} from '@oclif/core';
import {IsGitInstalled} from '../../../lib/decorators/preconditions';
import {SnapshotFacade} from '../../../lib/snapshot/snapshotFacade';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';

const mockedSnapshotFactory = jest.mocked(SnapshotFactory, true);
const mockedConfig = jest.mocked(Config);
const mockedProject = jest.mocked(Project);
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
const mockedIsGitInstalled = jest.mocked(IsGitInstalled, true);
const mockedSnapshotFacade = jest.mocked(SnapshotFacade, true);
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockEvaluate = jest.fn();

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
  mockedConfigGet.mockReturnValue({
    region: 'us',
    organization: 'foo',
    environment: 'prod',
  });

  mockedConfig.prototype.get = mockedConfigGet;
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

const mockSnapshotFactoryReturningSnapshotWithMissingVaultEntries =
  async () => {
    const missingVaultEntry = getMissingVaultEntryReport(
      'missing-vault-entry',
      ResourceSnapshotsReportType.Apply
    );
    const reporter = new SnapshotReporter(missingVaultEntry);
    mockedValidateSnapshot.mockResolvedValue(reporter);
    await mockSnapshotFactory();
  };

const mockSnapshotFacade = () => {
  mockedSnapshotFacade.mockImplementation(
    () =>
      ({
        tryAutomaticSynchronization: mockedTryAutomaticSynchronization,
      } as unknown as SnapshotFacade)
  );
};

describe('org:resources:preview', () => {
  const doMockPreconditions = function () {
    const mockGit = (_target: Command) => Promise.resolve();
    mockedIsGitInstalled.mockReturnValue(mockGit);
  };

  beforeAll(() => {
    mockConfig();
    mockProject();
    mockAuthenticatedClient();
  });

  beforeEach(() => {
    doMockPreconditions();
    mockUserHavingAllRequiredPlatformPrivileges();
  });

  afterEach(() => {
    mockEvaluate.mockClear();
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
      .do(() => {
        mockUserNotHavingAllRequiredPlatformPrivileges();
      })
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .catch(/You are not authorized to create snapshot/)
      .it('should return an error message if privileges are missing');

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .it('should use cwd as project', () => {
        expect(mockedProject).toHaveBeenCalledWith(cwd(), 'foo');
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
      .command(['org:resources:preview', '-o', 'myorg'])
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
      .catch(/Invalid snapshot/)
      .it('should throw an error for invalid snapshots');

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview'])
      .catch((ctx) => {
        expect(ctx.message).toContain(
          'https://platform.cloud.coveo.com/admin/#potato-org/organization/resource-snapshots/banana-snapshot'
        );
      })
      .it('should print an URL to the snapshot page');
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
      .catch(() => {
        expect(mockedTryAutomaticSynchronization).toHaveBeenCalledWith(true);
      })
      .it('should have detected and tried to resolves the conflicts');

    test
      .stdout()
      .stderr()
      .command(['org:resources:preview', '--sync'])
      .catch(() => {
        expect(mockedTryAutomaticSynchronization).toHaveBeenCalledWith(false);
      })
      .it(
        'should try to apply synchronization plan without asking for confirmation'
      );
  });

  describe('when the report contains resources with missing vault entries', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningSnapshotWithMissingVaultEntries();
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    describe('when the user refuses to migrate or type in the missing vault entries', () => {
      test
        .stdout()
        .stderr()
        .stub(CliUx.ux, 'confirm', () => async () => false)
        .command(['org:resources:preview'])
        .catch(/Your destination organization is missing vault entries/)
        .it('should throw an error for invalid snapshots');
    });
  });
});
