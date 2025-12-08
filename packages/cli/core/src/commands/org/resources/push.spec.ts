jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/cli-commons/utils/ux');

jest.mock('../../../../lib/lib/snapshot/snapshot');
jest.mock('../../../../lib/lib/snapshot/snapshotFactory');
jest.mock('../../../../lib/lib/project/project');

import {
  formatOrgId,
  startSpinner,
  stopSpinner,
  confirm,
} from '@coveo/cli-commons/utils/ux';
import {test} from '@oclif/test';
import {Project} from '../../../../lib/lib/project/project';
import {Config} from '@coveo/cli-commons/config/config';
import {SnapshotFactory} from '../../../../lib/lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../../lib/lib/snapshot/snapshot';
import {SnapshotReporter} from '../../../../lib/lib/snapshot/snapshotReporter';
import {
  ResourceSnapshotsReportType,
  ResourceSnapshotType,
  SnapshotAccessType,
} from '@coveo/platform-client';
import {
  getErrorReport,
  getMissingVaultEntryReport,
  getSuccessReport,
} from '../../../__stub__/resourceSnapshotsReportModel';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {MissingResourcePrivileges} from '../../../../lib/lib/errors/snapshotErrors';

const mockedSnapshotFactory = jest.mocked(SnapshotFactory);
const mockedConfig = jest.mocked(Config);
const mockedProject = jest.mocked(Project);
const mockedConfigGet = jest.fn();
const mockedDeleteTemporaryZipFile = jest.fn();
const mockedGetResourceManifest = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedAreResourcesInError = jest.fn();
const mockedApplySnapshot = jest.fn();
const mockedValidateSnapshot = jest.fn();
const mockedPreviewSnapshot = jest.fn();
const mockedLastReport = jest.fn();
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockEvaluate = jest.fn();
const mockedConfirm = jest.mocked(confirm);
jest.mocked(startSpinner);
jest.mocked(stopSpinner);
const mockedFormatOrgId = jest.mocked(formatOrgId);

const fakeProject = {
  deleteTemporaryZipFile: mockedDeleteTemporaryZipFile,
  getResourceManifest: mockedGetResourceManifest,
} as unknown as Project;

const mockProject = () => {
  mockedProject.mockImplementation(() => fakeProject);
};

const doMockConfig = () => {
  mockedConfigGet.mockReturnValue({
    region: 'us',
    organization: 'default-org',
    environment: 'prod',
  });

  mockedConfig.mockImplementation(
    () =>
      ({
        get: mockedConfigGet,
      } as unknown as Config)
  );
};

const mockSnapshotFactory = () => {
  mockedPreviewSnapshot.mockReturnValue(Promise.resolve(''));
  mockedSnapshotFactory.createSnapshotFromProject.mockImplementation(() =>
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

const mockUserNotHavingAllRequiredResourcePrivileges = () => {
  mockedSnapshotFactory.createFromOrg.mockImplementation(() => {
    throw new MissingResourcePrivileges(
      [ResourceSnapshotType.source, ResourceSnapshotType.mlModel],
      SnapshotAccessType.Write
    );
  });
};

const mockSnapshotFactoryReturningValidSnapshot = () => {
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
  mockSnapshotFactory();
};

const mockSnapshotFactoryReturningInvalidSnapshot = () => {
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
  mockSnapshotFactory();
};

const mockSnapshotFactoryReturningSnapshotWithMissingVaultEntries = () => {
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
  mockSnapshotFactory();
};

describe('org:resources:push', () => {
  beforeAll(() => {
    doMockConfig();
    mockProject();
    mockAuthenticatedClient();
  });

  beforeEach(() => {
    mockUserHavingAllRequiredPlatformPrivileges();
    mockedFormatOrgId.mockImplementation(
      (input: TemplateStringsArray | string) => input?.toString()
    );
    mockedConfirm.mockResolvedValue(true);
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

    test
      .do(() => {
        mockUserNotHavingAllRequiredResourcePrivileges();
      })
      .stdout()
      .stderr()
      .command(['org:resources:push'])
      .catch((ctx) => {
        expect(ctx.message).toMatchSnapshot();
      })
      .it('should return an error message if resource privileges are missing');
  });

  //#region TODO: CDX-948, setup phase needs to be rewrite and assertions 'split up' (e.g. the error ain't trigger directly by the function, therefore should not be handled)
  describe('when the dryRun returns a report without errors', () => {
    beforeAll(() => {
      mockSnapshotFactoryReturningValidSnapshot();
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('should preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('should apply the snapshot after confirmation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(false);
      })
      .command(['org:resources:push'])
      .it('should not apply the snapshot if not confirmed', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('should work with default connected org', () => {
        expect(
          mockedSnapshotFactory.createSnapshotFromProject
        ).toHaveBeenCalledWith(
          fakeProject,
          'default-org',
          expect.objectContaining({})
        );
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push', '-o', 'myorg'])
      .it('should work with specified target org', () => {
        expect(mockedProject).toHaveBeenCalledWith(expect.anything(), 'myorg');
        expect(
          mockedSnapshotFactory.createSnapshotFromProject
        ).toHaveBeenCalledWith(
          fakeProject,
          'myorg',
          expect.objectContaining({})
        );
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('should set a 60 seconds wait', () => {
        expect(
          mockedSnapshotFactory.createSnapshotFromProject
        ).toHaveBeenCalledWith(fakeProject, 'default-org', {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push', '-w', '99'])
      .it('should set a 99 seconds wait', () => {
        expect(
          mockedSnapshotFactory.createSnapshotFromProject
        ).toHaveBeenCalledWith(fakeProject, 'default-org', {wait: 99});
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('#should not apply missing resources', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(false, {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push', '--deleteMissingResources'])
      .it('should apply missing resoucres', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(true, {wait: 60});
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('should delete the compressed folder', () => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
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
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
      .command(['org:resources:push'])
      .it('should delete the snapshot', () => {
        expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .command(['org:resources:push', '--previewLevel', 'none'])
      .it('should apply snapshot without confrimation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
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
      .do(() => {
        mockedConfirm.mockResolvedValue(true);
      })
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
    beforeAll(() => {
      mockSnapshotFactoryReturningInvalidSnapshot();
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
    beforeAll(() => {
      mockSnapshotFactoryReturningSnapshotWithMissingVaultEntries();
    });

    describe('when the user refuses to migrate or type in the missing vault entries', () => {
      beforeEach(() => {
        mockedConfirm.mockResolvedValue(false);
      });
      test
        .stdout()
        .stderr()
        .command(['org:resources:push'])
        .catch(/Your destination organization is missing vault entries/)
        .it('should show the missingVaultEntries snapshot error');

      test
        .stdout()
        .stderr()
        .command(['org:resources:push'])
        .catch(() => {
          expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
          expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
        })
        .it('should only preview the snapshot');
    });
  });
  //#endregion
});
