jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshot');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('../../../lib/snapshot/snapshotFacade');

import {CliUx} from '@oclif/core';
import {test} from '@oclif/test';
import {Project} from '../../../lib/project/project';
import {join, normalize} from 'path';
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
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {SnapshotFacade} from '../../../lib/snapshot/snapshotFacade';

const mockedSnapshotFactory = jest.mocked(SnapshotFactory, true);
const mockedConfig = jest.mocked(Config);
const mockedProject = jest.mocked(Project);
const mockedConfigGet = jest.fn();
const mockedDeleteTemporaryZipFile = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedAreResourcesInError = jest.fn();
const mockedTryAutomaticSynchronization = jest.fn();
const mockedSnapshotFacade = jest.mocked(SnapshotFacade, true);
const mockedApplySnapshot = jest.fn();
const mockedValidateSnapshot = jest.fn();
const mockedPreviewSnapshot = jest.fn();
const mockedLastReport = jest.fn();
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
  mockedConfigGet.mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'foo',
      environment: 'prod',
    })
  );

  mockedConfig.prototype.get = mockedConfigGet;
};

const mockSnapshotFacade = () => {
  mockedSnapshotFacade.mockImplementation(
    () =>
      ({
        tryAutomaticSynchronization: mockedTryAutomaticSynchronization,
      } as unknown as SnapshotFacade)
  );
};

const mockSnapshotFactory = async () => {
  mockedPreviewSnapshot.mockReturnValue(Promise.resolve(``));
  mockedSnapshotFactory.createFromZip.mockImplementation(() =>
    Promise.resolve({
      apply: mockedApplySnapshot,
      validate: mockedValidateSnapshot,
      preview: mockedPreviewSnapshot,
      delete: mockedDeleteSnapshot,
      saveDetailedReport: mockedSaveDetailedReport,
      areResourcesInError: mockedAreResourcesInError,
      latestReport: mockedLastReport,
      id: 'banana-snapshot',
      targetId: 'potato-org',
    } as unknown as Snapshot)
  );
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

const mockSnapshotFactoryReturningValidSnapshot = async () => {
  const successReportValidate = getSuccessReport(
    'success-report',
    ResourceSnapshotsReportType.DryRun
  );
  const successReportApply = getSuccessReport(
    'success-report',
    ResourceSnapshotsReportType.Apply
  );

  mockedValidateSnapshot.mockImplementation(
    () => new SnapshotReporter(successReportValidate)
  );
  mockedApplySnapshot.mockImplementation(
    () => new SnapshotReporter(successReportApply)
  );
  await mockSnapshotFactory();
};

const mockSnapshotFactoryReturningInvalidSnapshot = async () => {
  const errorReportValidate = getErrorReport(
    'error-report',
    ResourceSnapshotsReportType.DryRun
  );
  const errorReportApply = getErrorReport(
    'error-report',
    ResourceSnapshotsReportType.Apply
  );
  mockedValidateSnapshot.mockImplementation(
    () => new SnapshotReporter(errorReportValidate)
  );
  mockedApplySnapshot.mockImplementation(() =>
    Promise.resolve(new SnapshotReporter(errorReportApply))
  );
  await mockSnapshotFactory();
  mockSnapshotFacade();
};

const mockSnapshotFactoryReturningSnapshotWithMissingVaultEntries =
  async () => {
    const missingVaultEntriesValidate = getMissingVaultEntryReport(
      'error-report',
      ResourceSnapshotsReportType.DryRun
    );
    const missingVaultEntriesApply = getMissingVaultEntryReport(
      'error-report',
      ResourceSnapshotsReportType.Apply
    );
    mockedValidateSnapshot.mockImplementation(() =>
      Promise.resolve(new SnapshotReporter(missingVaultEntriesValidate))
    );
    mockedApplySnapshot.mockImplementation(() =>
      Promise.resolve(new SnapshotReporter(missingVaultEntriesApply))
    );
    await mockSnapshotFactory();
  };

describe('org:resources:push', () => {
  beforeAll(() => {
    mockConfig();
    mockProject();
    mockAuthenticatedClient();
  });

  beforeEach(() => {
    mockUserHavingAllRequiredPlatformPrivileges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when preconditions are not respected', () => {
    test
      .do(() => {
        mockUserNotHavingAllRequiredPlatformPrivileges();
      })
      .stdout()
      .stderr()
      .command(['org:resources:push'])
      .catch(/You are not authorized to create snapshot/)
      .it('should return an error message if privileges are missing');
  });
  //#region TODO: CDX-948, setup phase needs to be rewrite and assertions 'split up' (e.g. the error ain't trigger directly by the function, therefore should not be handled)
  describe('when the dryRun returns a report without errors', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningValidSnapshot();
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should apply the snapshot after confirmation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => false)
      .command(['org:resources:push'])
      .it('should not apply the snapshot if not confirmed', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
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
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push', '-o', 'myorg'])
      .it('should work with specified target org', () => {
        expect(mockedProject).toHaveBeenCalledWith(expect.anything(), 'myorg');
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'myorg',
          expect.objectContaining({})
        );
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
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
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push', '-w', '99'])
      .it('should set a 99 seconds wait', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          {wait: 99}
        );
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('#should not apply missing resources', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(false, {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push', '-d'])
      .it('should apply missing resoucres', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(true, {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should delete the compressed folder', () => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .do(() => {
        mockedValidateSnapshot.mockImplementationOnce(() => {
          throw new Error('You shall not pass');
        });
      })
      .command(['org:resources:push'])
      .catch(() => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      })
      .it('should delete the compressed folder on error');

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should delete the snapshot', () => {
        expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:push', '--skipPreview'])
      .it('should apply snapshot without confrimation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push', '--previewLevel', 'light'])
      .it('should only display light preview', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          false
        );
      });

    test
      .stdout()
      .stderr()
      .stub(CliUx.ux, 'confirm', () => async () => true)
      .command(['org:resources:push', '--previewLevel', 'detailed'])
      .it('should display light and expanded preview', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          true
        );
      });
  });

  describe('when the dryRun returns a report with errors', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningInvalidSnapshot();
    });

    test
      .stdout()
      .stderr()
      .command(['org:resources:push'])
      .catch(/Invalid snapshot/)
      .it('should show the invalid snapshot error');

    test
      .stdout()
      .stderr()
      .command(['org:resources:push'])
      .catch(() => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      })
      .it('should only preview the snapshot');

    test
      .stdout()
      .stderr()
      .command(['org:resources:push'])
      .catch(/Invalid snapshot/)
      .it('should return an invalid snapshot error message');
  });

  describe('when the dryRun returns a report with missing vault entries', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningSnapshotWithMissingVaultEntries();
    });

    describe('when the user refuses to migrate or type in the missing vault entries', () => {
      test
        .stdout()
        .stderr()
        .command(['org:resources:push'])
        .catch(/Your snapshot is missing some vault entries/)
        .it('should show the missingVaultEntries snapshot error');

      test
        .stdout()
        .stderr()
        .command(['org:resources:push'])
        .catch(/Your snapshot is missing some vault entries/)
        .it('should only preview the snapshot', () => {
          expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
          expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
        });
    });
  });
  //#endregion
});
