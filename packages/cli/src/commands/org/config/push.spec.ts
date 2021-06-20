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

const mockedSnapshotFactory = mocked(SnapshotFactory, true);
const mockedConfig = mocked(Config);
const mockedProject = mocked(Project);
const mockedError = mocked(error);
const mockedConfigGet = jest.fn();
const mockedDeleteTemporaryZipFile = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedRequiresSynchronization = jest.fn();
const mockedApplySnapshot = jest.fn();
const mockedValidateSnapshot = jest.fn();
const mockedPreviewSnapshot = jest.fn();
const mockedLastReport = jest.fn();
const mockedHasChangedResources = jest.fn();

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
      region: 'us-east-1',
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
      apply: mockedApplySnapshot,
      validate: mockedValidateSnapshot,
      preview: mockedPreviewSnapshot,
      delete: mockedDeleteSnapshot,
      saveDetailedReport: mockedSaveDetailedReport,
      requiresSynchronization: mockedRequiresSynchronization,
      latestReport: mockedLastReport,
      hasChangedResources: mockedHasChangedResources,
      id: 'banana-snapshot',
      targetId: 'potato-org',
    } as unknown as Snapshot)
  );
};

const mockSnapshotFactoryReturningValidSnapshot = async () => {
  // TODO: CDX-390: Test when there are no changes
  mockedHasChangedResources.mockReturnValue(true);
  mockedValidateSnapshot.mockResolvedValue({isValid: true, report: {}});
  mockedApplySnapshot.mockResolvedValue({isValid: true, report: {}});
  await mockSnapshotFactory();
};

const mockSnapshotFactoryReturningInvalidSnapshot = async () => {
  // TODO: CDX-390: Test when there are no changes
  mockedHasChangedResources.mockReturnValue(true);
  mockedValidateSnapshot.mockResolvedValue({isValid: false, report: {}});
  mockedApplySnapshot.mockResolvedValue({isValid: false, report: {}});
  await mockSnapshotFactory();
};

describe('org:config:push', () => {
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
      .command(['org:config:push'])
      .it('should preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push'])
      .it('should apply the snapshot after confirmation', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stub(cli, 'confirm', () => async () => false)
      .command(['org:config:push'])
      .it('should not apply the snapshot if not confirmed', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push'])
      .it('should work with default connected org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo'
        );
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push', '-t', 'myorg'])
      .it('should work with specified target org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'myorg'
        );
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push'])
      .it('#should not apply missing resources', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(false);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push', '-d'])
      .it('should apply missing resoucres', () => {
        expect(mockedApplySnapshot).toHaveBeenCalledWith(true);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push'])
      .it('should delete the compressed folder', () => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      });

    test
      .stub(cli, 'confirm', () => async () => true)
      .command(['org:config:push'])
      .it('should delete the snapshot', () => {
        expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .command(['org:config:push', '--skip-preview'])
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
      .command(['org:config:push'])
      .it('should show the failed validation', (ctx) => {
        expect(ctx.stderr).toContain('Validating snapshot... !');
      });

    test
      .command(['org:config:push'])
      .it('should only preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
        expect(mockedApplySnapshot).toHaveBeenCalledTimes(0);
      });

    test
      .command(['org:config:push'])
      .it('should return an invalid snapshot error message', () => {
        expect(mockedError).toHaveBeenCalledWith(
          expect.stringContaining('Invalid snapshot'),
          {}
        );
      });
  });
});
