jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshot');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('@oclif/errors');

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {Project} from '../../../lib/project/project';
import {join, normalize} from 'path';
import {cli} from 'cli-ux';
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

const mockedSnapshotFactory = mocked(SnapshotFactory, true);
const mockedConfig = mocked(Config);
const mockedProject = mocked(Project);
const mockedError = mocked(error);
const mockedConfigGet = jest.fn();
const mockedDeleteTemporaryZipFile = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedAreResourcesInError = jest.fn();
const mockedApplySnapshot = jest.fn();
const mockedValidateSnapshot = jest.fn();
const mockedPreviewSnapshot = jest.fn();
const mockedLastReport = jest.fn();

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

const mockSnapshotFactoryReturningValidSnapshot = async () => {
  const successReportValidate = getSuccessReport(
    'success-report',
    ResourceSnapshotsReportType.DryRun
  );
  const successReportApply = getSuccessReport(
    'success-report',
    ResourceSnapshotsReportType.Apply
  );

  mockedValidateSnapshot.mockResolvedValue(
    new SnapshotReporter(successReportValidate)
  );
  mockedApplySnapshot.mockResolvedValue(
    new SnapshotReporter(successReportApply)
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
  mockedValidateSnapshot.mockResolvedValue(
    new SnapshotReporter(errorReportValidate)
  );
  mockedApplySnapshot.mockResolvedValue(new SnapshotReporter(errorReportApply));
  await mockSnapshotFactory();
};

describe('org:resources:push', () => {
  beforeAll(() => {
    mockConfig();
    mockProject();
  });

  describe('when the dryRun returns a report without errors', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningValidSnapshot();
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should apply the snapshot after confirmation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stub(cli, 'confirm', () => async () => false)
      .command(['org:resources:push'])
      .it('should not apply the snapshot if not confirmed', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should work with default connected org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          expect.objectContaining({})
        );
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push', '-t', 'myorg'])
      .it('should work with specified target org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'myorg',
          expect.objectContaining({})
        );
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should set a 60 seconds wait', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          {wait: 60}
        );
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push', '-w', '99'])
      .it('should set a 99 seconds wait', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo',
          {wait: 99}
        );
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('#should not apply missing resources', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(false, {wait: 60});
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push', '-d'])
      .it('should apply missing resoucres', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(true, {wait: 60});
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should delete the compressed folder', () => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
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
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:resources:push'])
      .it('should delete the snapshot', () => {
        expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .command(['org:resources:push', '--skipPreview'])
      .it('should apply snapshot without confrimation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });
  });

  describe('when the dryRun returns a report with errors', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningInvalidSnapshot();
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stderr()
      .command(['org:resources:push'])
      .it('should show the failed validation', (ctx) => {
        expect(ctx.stderr).toContain('Validating snapshot... !');
      });

    test
      .command(['org:resources:push'])
      .it('should only preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      });

    test
      .command(['org:resources:push'])
      .it('should return an invalid snapshot error message', () => {
        expect(mockedError).toHaveBeenCalledWith(
          expect.stringContaining('Invalid snapshot')
        );
      });
  });
});
