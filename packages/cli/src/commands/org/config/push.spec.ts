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
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {warn, error} from '@oclif/errors';

const mockedSnapshotFactory = mocked(SnapshotFactory, true);
const mockedConfig = mocked(Config);
const mockedProject = mocked(Project);
const mockedWarn = mocked(warn);
const mockedError = mocked(error);
const mockedConfigGet = jest.fn();
const mockedDeleteTemporaryZipFile = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedRequiresSynchronization = jest.fn();
const mockedPushSnapshot = jest.fn();
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
      push: mockedPushSnapshot,
      validate: mockedValidateSnapshot,
      preview: mockedPreviewSnapshot,
      delete: mockedDeleteSnapshot,
      saveDetailedReport: mockedSaveDetailedReport,
      requiresSynchronization: mockedRequiresSynchronization,
      latestReport: mockedLastReport,
      id: 'banana-snapshot',
      targetId: 'potato-org',
    } as unknown as Snapshot)
  );
};

const mockSnapshotFactoryReturningValidSnapshot = async () => {
  mockedValidateSnapshot.mockResolvedValue({isValid: true, report: {}});
  await mockSnapshotFactory();
};

const mockSnapshotFactoryReturningInvalidSnapshot = async () => {
  mockedValidateSnapshot.mockResolvedValue({isValid: false, report: {}});
  await mockSnapshotFactory();
};

// TODO:!!!
describe.skip('org:config:push', () => {
  const confirmationString = 'Would you like to apply these changes to the org';

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
      .command(['org:config:preview'])
      .it('should preview the snapshot first', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .stderr()
      .command(['org:config:preview'])
      .it('should prompt the user', (ctx) => {
        expect(ctx.stderr).toContain(confirmationString);
      });

    test
      .skip()
      .command(['org:config:preview'])
      .it('should work with default connected org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'foo'
        );
      });

    test
      .skip()
      .command(['org:config:preview', '-t', 'myorg'])
      .it('should work with specified target org', () => {
        expect(mockedSnapshotFactory.createFromZip).toHaveBeenCalledWith(
          normalize(join('path', 'to', 'resources.zip')),
          'myorg'
        );
      });

    test
      .skip()
      .command(['org:config:preview'])
      .it('#validate should not take into account missing resources', () => {
        expect(mockedValidateSnapshot).toHaveBeenCalledWith(false);
      });

    test
      .skip()
      .command(['org:config:preview', '-d'])
      .it('#validate should take into account missing resoucres', () => {
        expect(mockedValidateSnapshot).toHaveBeenCalledWith(true);
      });

    test
      .skip()
      .command(['org:config:preview'])
      .it('should preview the snapshot', () => {
        expect(mockedPreviewSnapshot).toHaveBeenCalledTimes(1);
      });

    test
      .skip()
      .command(['org:config:preview'])
      .it('should delete the compressed folder', () => {
        expect(mockedDeleteTemporaryZipFile).toHaveBeenCalledTimes(1);
      });

    test
      .skip()
      .command(['org:config:preview'])
      .it('should delete the snapshot', () => {
        expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      });
  });

  describe('when the dryRun returns a report containing errors', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningInvalidSnapshot();
    });

    beforeEach(() => {
      // mockedRequiresSynchronization.mockReturnValueOnce(false);
      // mockedSaveDetailedReport.mockReturnValueOnce(
      //   normalize(join('saved', 'snapshot'))
      // );
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .stderr()
      .command(['org:config:push'])
      .it('should show that the validation has failed', (ctx) => {
        expect(ctx.stderr).toContain('Validating snapshot... !');
      });

    test
      .stderr()
      .command(['org:config:push'])
      .it('should not prpopose to apply changes', (ctx) => {
        expect(ctx.stderr).not.toContain(confirmationString);
      });
  });

  describe.skip('when the snapshot is not in sync with the target org', () => {
    beforeAll(async () => {
      await mockSnapshotFactoryReturningInvalidSnapshot();
    });

    beforeEach(() => {
      mockedRequiresSynchronization.mockReturnValueOnce(true);
      mockedSaveDetailedReport.mockReturnValueOnce(join('saved', 'snapshot'));
    });

    afterAll(() => {
      mockedSnapshotFactory.mockReset();
    });

    test
      .command(['org:config:preview'])
      .it('should have detected some conflicts', () => {
        expect(mockedWarn).toHaveBeenCalledWith(
          expect.stringContaining(
            'Some conflicts were detected while comparing changes between the snapshot and the target organization'
          )
        );
      });

    test
      .command(['org:config:preview'])
      .it('should print an url to the synchronization page', () => {
        expect(mockedWarn).toHaveBeenCalledWith(
          expect.stringContaining(
            'https://platform.cloud.coveo.com/admin/#potato-org/organization/resource-snapshots/banana-snapshot/synchronization'
          )
        );
      });
  });
});

// TODO: CDX-403: test --skip-preview flag
